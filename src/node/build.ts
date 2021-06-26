import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { build as viteBuild, BuildOptions, InlineConfig } from 'vite';
import { RollupOutput, OutputChunk, OutputAsset } from 'rollup';
import type { HelmetData } from 'react-helmet';
import { resolveConfig } from './config';
import { createOnePressPlugin } from './plugin';
import { REACT_PAGES_MODULE_ID } from './constants';
import { SiteConfig } from './types';

async function bundle(siteConfig: SiteConfig, buildOptions: BuildOptions) {
  const resolveViteConfig = (ssr: boolean): InlineConfig => {
    return {
      configFile: false,
      root: siteConfig.root,
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
          'react-helmet',
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
        ssrManifest: !ssr,
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

  const spinner = ora('build client + server bundles...').start();
  let clientResult: RollupOutput;

  try {
    [clientResult] = (await Promise.all([
      viteBuild(resolveViteConfig(false)),
      viteBuild(resolveViteConfig(true)),
    ])) as [RollupOutput, RollupOutput];

    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  return clientResult;
}

async function renderPages(siteConfig: SiteConfig, clientResult: RollupOutput) {
  const entryChunk = clientResult.output.find(
    chunk => chunk.type === 'chunk' && chunk.isEntry
  ) as OutputChunk;

  const cssChunks = clientResult.output.filter(
    chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  ) as OutputAsset[];

  // it is generated in building client bundle
  const manifest = require(path.resolve(
    siteConfig.outDir,
    'ssr-manifest.json'
  ));

  // it is generated in building server bundle
  const { renderToString, ssrData } = require(path.resolve(
    siteConfig.tempDir,
    'serverRender.js'
  ));
  const pagePaths = Object.keys(ssrData);

  const spinner = ora('render pages...').start();

  try {
    await Promise.all(
      pagePaths.map(async pagePath => {
        // not support page with path param
        if (/\/:\w/.test(pagePath)) {
          return;
        }

        const content = renderToString(pagePath);

        const helmetData: HelmetData =
          require('react-helmet').Helmet.renderStatic();

        const preloadLinks = getPreloadLinks(siteConfig, manifest, pagePath);

        const html = `
<html ${helmetData.htmlAttributes.toString()}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${helmetData.title.toString()}
    ${helmetData.meta.toString()}
    ${cssChunks.map(
      cssChunk =>
        `<link rel="stylesheet" href="${siteConfig.base}${cssChunk.fileName}" />`
    )}
    ${preloadLinks}
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

    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }
}

function getPreloadLinks(
  siteConfig: SiteConfig,
  manifest: any,
  pagePath: string
) {
  const preloadFiles: string[] =
    manifest[
      `${REACT_PAGES_MODULE_ID}${pagePath === '/' ? '/index__' : pagePath}`
    ] || [];

  return preloadFiles
    .map(file => {
      const href = `${siteConfig.base}${file.replace(/^\//, '')}`;
      return `<link rel="modulepreload" href="${href}">`;
    })
    .join('\n    ');
}

export async function build(
  root = process.cwd(),
  buildOptions: BuildOptions = {}
) {
  const start = Date.now();
  const siteConfig = await resolveConfig(root);

  try {
    const clientResult = await bundle(siteConfig, buildOptions);
    await renderPages(siteConfig, clientResult);
  } finally {
    await fs.remove(siteConfig.tempDir)
  }

  console.log(
    `build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`
  );
}
