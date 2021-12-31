import path from 'path';
import { createRequire } from 'module';
import fs from 'fs-extra';
import ora from 'ora';
import { build as viteBuild, BuildOptions, InlineConfig } from 'vite';
import { RollupOutput, OutputChunk, OutputAsset } from 'rollup';
import type { HelmetData } from 'react-helmet';
import { resolveConfig } from './config.js';
import { createOnePressPlugin } from './plugins/index.js';
import { trapConsole } from './utils.js';
import { Page, SiteConfig } from './types.js';
import { CSR_ENTRY_PATH, SSR_ENTRY_PATH } from './constants.js';

const require = createRequire(import.meta.url);

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
        noExternal: ['onepress', /onepress-theme-/],
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
          input: require.resolve(ssr ? SSR_ENTRY_PATH : CSR_ENTRY_PATH),
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

  const cssChunks = (
    clientResult.output.filter(
      chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
    ) as OutputAsset[]
  )
    .map(
      cssChunk =>
        `<link rel="stylesheet" href="${siteConfig.base}${cssChunk.fileName}" />`
    )
    .join('\n    ');

  // it is generated in building client bundle
  const manifest = require(path.resolve(
    siteConfig.outDir,
    'ssr-manifest.json'
  ));

  // it is generated in building server bundle
  const { render, pagesData } = require(path.resolve(
    siteConfig.tempDir,
    'entry.server.js'
  )) as {
    render: (pagePath: string) => string;
    pagesData: Record<string, Page>;
  };
  const pagePaths = Object.keys(pagesData);

  console.log('pagePaths', pagePaths);

  const spinner = ora('render pages...').start();

  try {
    await Promise.all(
      Object.entries(pagesData).map(async ([pagePath, pageData]) => {
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

        const pageChunk = clientResult.output.find(
          chunk =>
            chunk.type === 'chunk' &&
            chunk.facadeModuleId?.endsWith(pageData.filePath)
        ) as OutputChunk;

        const preloadLinks = getPreloadLinks(siteConfig, entryChunk, pageChunk);

        // for client hydrate
        const ssrData = {
          routePath: pagePath,
          assetPath: `${siteConfig.base}${pageChunk.fileName}`,
        };

        const html = `<!DOCTYPE html>
<html ${helmetData.htmlAttributes.toString()}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${helmetData.title.toString()}
    ${helmetData.meta.toString()}
    ${helmetData.link.toString()}
    ${helmetData.style.toString()}
    ${cssChunks}
    ${preloadLinks}
  </head>
  <body ${helmetData.bodyAttributes.toString()}>
    <div id="app">${appHtml}</div>
    <script>window.__OP_SSR_DATA__ = ${JSON.stringify(ssrData)};</script>
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
  entryChunk: OutputChunk,
  pageChunk: OutputChunk
) {
  return Array.from(
    new Set([
      entryChunk.fileName,
      ...entryChunk.imports,
      ...entryChunk.dynamicImports,
      pageChunk.fileName,
      ...pageChunk.imports,
      ...pageChunk.dynamicImports,
    ])
  )
    .map(file => {
      const href = `${siteConfig.base}${file}`;
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
