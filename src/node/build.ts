import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { build as viteBuild, BuildOptions, InlineConfig } from 'vite';
import { RollupOutput, OutputChunk, OutputAsset } from 'rollup';
import { resolveConfig } from './config';
import { createOnePressPlugin } from './plugin';

const okMark = '\x1b[32m✓\x1b[0m';
const failMark = '\x1b[31m✖\x1b[0m';

export async function build(
  root = process.cwd(),
  buildOptions: BuildOptions = {}
) {
  const start = Date.now();
  const siteConfig = await resolveConfig(root);

  const resolveViteConfig = (ssr: boolean): InlineConfig => {
    return {
      configFile: false,
      root,
      base: siteConfig.base,
      plugins: createOnePressPlugin(siteConfig, ssr),
      logLevel: 'warn',
      // @ts-ignore
      ssr: {
        external: [
          'react',
          'react-router-dom',
          'react-dom',
          'react-dom/server',
        ],
        noExternal: [
          'vite-plugin-react-pages',
          'vite-plugin-react-pages/client',
          'vite-pages-theme-press',
          'onepress',
        ],
      },
      build: {
        ...buildOptions,
        ssr,
        emptyOutDir: true,
        outDir: ssr ? siteConfig.tempDir : siteConfig.outDir,
        cssCodeSplit: false,
        minify: !ssr,
        rollupOptions: {
          ...buildOptions.rollupOptions,
          input: require.resolve(
            ssr
              ? 'vite-plugin-react-pages/dist/client/ssr/serverRender'
              : 'vite-plugin-react-pages/dist/client/ssr/clientRender'
          ),
          preserveEntrySignatures: 'allow-extension',
          output: {
            ...buildOptions.rollupOptions?.output,
          },
        },
      },
    };
  };

  let clientResult: RollupOutput;
  const bundleSpinner = ora();

  bundleSpinner.start('building client + server bundles...');

  try {
    [clientResult] = (await Promise.all([
      viteBuild(resolveViteConfig(false)),
      viteBuild(resolveViteConfig(true)),
    ])) as [RollupOutput, RollupOutput];
  } catch (e) {
    bundleSpinner.stopAndPersist({ symbol: failMark });
    throw e;
  }

  bundleSpinner.stopAndPersist({ symbol: okMark });

  const entryChunk = clientResult.output.find(
    chunk => chunk.type === 'chunk' && chunk.isEntry
  ) as OutputChunk;

  const cssChunks = clientResult.output.filter(
    chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  ) as OutputAsset[];

  const { renderToString, ssrData } = require(path.resolve(
    siteConfig.tempDir,
    'serverRender.js'
  ));
  const pagePaths = Object.keys(ssrData);

  const renderSpinner = ora();
  renderSpinner.start('rendering pages...');

  try {
    await Promise.all(
      pagePaths.map(async pagePath => {
        // not support page with path param
        if (/\/:\w/.test(pagePath)) {
          return;
        }

        const content = renderToString(pagePath);

        // TODO: inject preload

        const html = `
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${cssChunks.map(
      cssChunk =>
        `<link rel="stylesheet" href="${siteConfig.base}${cssChunk.fileName}" />`
    )}
  </head>
  <body>
    <script>
      window._vitePagesSSR = ${JSON.stringify({ routePath: pagePath })};
    </script>
    <div id="root">${content}</div>
    <script type="module" src="${siteConfig.base}${
          entryChunk.fileName
        }"></script>
  </body>
</html>`;

        const targetPath = path.join(
          siteConfig.outDir,
          pagePath.toLowerCase(),
          'index.html'
        );

        await fs.outputFile(targetPath, html);
      })
    );
  } catch (e) {
    renderSpinner.stopAndPersist({ symbol: failMark });
    throw e;
  }

  renderSpinner.stopAndPersist({ symbol: okMark });

  await fs.remove(siteConfig.tempDir);

  console.log(
    `build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`
  );
}
