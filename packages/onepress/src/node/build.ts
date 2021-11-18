import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { build as viteBuild, BuildOptions, InlineConfig } from 'vite';
import { RollupOutput, OutputChunk, OutputAsset } from 'rollup';
import type { HelmetData } from 'react-helmet';
import { resolveConfig } from './config';
import { createOnePressPlugin } from './plugins';
import { trapConsole } from './utils';
import { Page, SiteConfig } from './types';

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
        // set react-helmet to external so that we can use the same instance of react-helmet.
        // see: https://github.com/nfl/react-helmet#note-use-the-same-instance
        external: ['react-helmet'],
        noExternal: ['onepress/theme', 'onepress/client'],
      },
      build: {
        ...buildOptions,
        ssr,
        // avoid empty outDir while building because we will build client and server in parallel
        emptyOutDir: false,
        outDir: ssr ? siteConfig.tempDir : siteConfig.outDir,
        cssCodeSplit: false,
        minify: !ssr,
        ssrManifest: !ssr,
        rollupOptions: {
          ...buildOptions.rollupOptions,
          input: require.resolve(
            ssr
              ? path.resolve(__dirname, '../client/entry.server.js')
              : path.resolve(__dirname, '../client/entry.client.js')
          ),
        },
      },
    };
  };

  const spinner = ora('build client + server bundles...').start();
  let clientResult: RollupOutput;

  // empty outDir before build
  if (buildOptions.emptyOutDir !== false) {
    await fs.emptyDir(siteConfig.outDir);
  }

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
  const { render, pagesData } = require(path.resolve(
    siteConfig.tempDir,
    'entry.server.js'
  ));
  const pagePaths = Object.keys(pagesData);

  console.log('pagePaths', pagePaths);

  const spinner = ora('render pages...').start();

  try {
    await Promise.all(
      pagePaths.map(async pagePath => {
        // not support page with path param
        if (/\/:\w/.test(pagePath)) {
          return;
        }

        // disable console while rendering
        const recoverConsole = trapConsole();
        const appHtml = render(pagePath);
        recoverConsole();

        // get helmet data after render
        const helmetData: HelmetData =
          require('react-helmet').Helmet.renderStatic();

        const preloadLinks = getPreloadLinks(
          siteConfig,
          manifest,
          pagesData[pagePath]
        );

        const html = `<!DOCTYPE html>
<html ${helmetData.htmlAttributes.toString()}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${helmetData.title.toString()}
    ${helmetData.meta.toString()}
    ${helmetData.link.toString()}
    ${helmetData.style.toString()}
    ${cssChunks.map(
      cssChunk =>
        `<link rel="stylesheet" href="${siteConfig.base}${cssChunk.fileName}" />`
    )}
    ${preloadLinks}
  </head>
  <body ${helmetData.bodyAttributes.toString()}>
    <div id="app">${appHtml}</div>
    <script type="module" src="${siteConfig.base}${
          entryChunk.fileName
        }"></script>
  </body>
</html>
`;

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
  pageData: Page
) {
  const preloadFiles: string[] = manifest[pageData.filePath] || [];

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
  const siteConfig = resolveConfig(root);

  try {
    const clientResult = await bundle(siteConfig, buildOptions);
    await renderPages(siteConfig, clientResult);
  } finally {
    await fs.remove(siteConfig.tempDir);
  }

  console.log(
    `build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`
  );
}
