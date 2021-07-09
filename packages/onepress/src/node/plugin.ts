import path from 'path';
import {
  mergeConfig,
  send,
  Plugin,
  PluginOption,
  UserConfig as ViteConfig,
} from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactPages from 'vite-plugin-react-pages';
import mdx from 'vite-plugin-mdx';
import chalk from 'chalk';
import grayMatter from 'gray-matter';
import { resolveConfig, isConfigChanged } from './config';
import {
  REACT_PAGES_APP_ENTRY,
  REACT_PAGES_THEME_ENTRY,
  THEME_CONFIG_ID,
  THEME_CONFIG_REQUEST_PATH,
} from './constants';
import { cleanPath, normalizePath } from './utils';
import { SiteConfig } from './types';

export function createOnePressPlugin(
  config: SiteConfig,
  ssr: boolean
): Plugin[] {
  let { theme: themeConfig = {} } = config;

  const onepressPlugin: Plugin = {
    name: 'onepress',

    config: originalConfig => {
      // override optimizeDeps.include of vite-plugin-react-pages
      if (originalConfig.optimizeDeps) {
        originalConfig.optimizeDeps.include = [
          'react',
          'react-dom',
          'react-router-dom',
        ];
      }

      const viteConfig: ViteConfig = {
        resolve: {
          alias: [
            // We alias the app entry and theme entry, and it will skip the vite-plugin-react-pages
            {
              find: REACT_PAGES_APP_ENTRY,
              replacement: require.resolve(
                'vite-plugin-react-pages/dist/client/main.js'
              ),
            },
            {
              find: REACT_PAGES_THEME_ENTRY,
              replacement: config.themePath,
            },
            {
              find: THEME_CONFIG_ID,
              replacement: THEME_CONFIG_REQUEST_PATH,
            },
            {
              find: /^onepress$/,
              replacement: path.resolve(__dirname, '../client/index'),
            },
            {
              find: /^onepress\//,
              replacement: path.resolve(__dirname, '../../') + '/',
            },
            {
              find: /^react$/,
              replacement: require.resolve('react'),
            },
            {
              find: /^react-dom$/,
              replacement: require.resolve('react-dom'),
            },
            {
              find: /^react-router-dom$/,
              replacement: require.resolve('react-router-dom'),
            },
            {
              find: /^@mdx-js\/react$/,
              replacement: require.resolve('@mdx-js/react/dist/esm.js'),
            },
            {
              find: 'react-helmet',
              replacement: require.resolve('react-helmet'),
            },
            {
              find: 'vite-plugin-react-pages',
              replacement: (() => {
                // FIXME: simplify it using regexp
                const reactPagesRoot =
                  require
                    .resolve('vite-plugin-react-pages')
                    .split('vite-plugin-react-pages')
                    .slice(0, -1) + 'vite-plugin-react-pages';
                return reactPagesRoot;
              })(),
            },
          ],
        },
        optimizeDeps: {
          include: ['react-helmet'],
          exclude: ['onepress'],
        },
      };

      return config.vite ? mergeConfig(config.vite, viteConfig) : viteConfig;
    },

    configureServer(server) {
      if (config.configPath) {
        server.watcher.add(config.configPath);
      }

      // serve custom html
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && cleanPath(req.url).endsWith('.html')) {
            let html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${REACT_PAGES_APP_ENTRY}"></script>
  </body>
</html>
`;
            // need execute `transformIndexHtml` here so that other plugins can do something
            html = await server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl
            );
            return send(req, res, html, 'html');
          }
          next();
        });
      };
    },

    resolveId(id) {
      if (id === THEME_CONFIG_REQUEST_PATH) {
        return THEME_CONFIG_REQUEST_PATH;
      }
    },

    load(id) {
      if (id === THEME_CONFIG_REQUEST_PATH) {
        return `export default ${JSON.stringify(JSON.stringify(themeConfig))}`;
      }
    },

    async handleHotUpdate(ctx) {
      // handle config hmr
      const { file, server } = ctx;

      if (config.configPath && file === normalizePath(config.configPath)) {
        const newConfig = await resolveConfig(config.root);
        themeConfig = newConfig.theme || {};

        if (isConfigChanged(config, newConfig)) {
          console.warn(
            chalk.yellow(
              `[onepress] config has changed. Please restart the dev server.`
            )
          );
        }

        return [server.moduleGraph.getModuleById(THEME_CONFIG_REQUEST_PATH)!];
      }
    },

    generateBundle(_, bundle) {
      // ssr build. delete all asset chunks
      if (ssr) {
        for (const name in bundle) {
          if (bundle[name].type === 'asset') {
            delete bundle[name];
          }
        }
      }
    },
  };

  // Injecting other plugins inside the config hook will have no effect,
  // so we inject the user plugins here.
  // (we need to flat them)
  const userVitePlugins = config.vite?.plugins
    ?.flatMap(item => item)
    .filter<Plugin>((item: PluginOption): item is Plugin => Boolean(item));

  return [
    ...(userVitePlugins || []),
    reactRefresh(config.reactRefresh),
    reactPages(config.reactPages),
    // vite-plugin-mdx looks for dependencies such as react from the vite root, which may cause errors,
    // so I inject the dependency myself here.
    //
    // I also inject frontMater here.
    {
      name: 'onepress:preMdx',
      transform(code, id) {
        if (/\.mdx?$/.test(id)) {
          const { data: frontMatter, content } = grayMatter(code);
          return `
import React from 'react';
import { mdx } from '@mdx-js/react';

export const frontMatter = ${JSON.stringify(frontMatter)};

${content}`;
        }
      },
    },
    // at the same time, I use `withImport({})` here to avoid MDX errors.
    ...mdx.withImports({})(config.mdx),
    // ...mdx(config.mdx),
    onepressPlugin,
  ];
}
