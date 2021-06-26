import path from 'path';
import { mergeConfig, send, Plugin, UserConfig as ViteConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import mdx from 'vite-plugin-mdx';
import reactPages from 'vite-plugin-react-pages';
import { resolveConfig, isConfigChanged } from './config';
import {
  REACT_PAGES_APP_ENTRY,
  REACT_PAGES_THEME_ENTRY,
  THEME_CONFIG_ID,
  THEME_CONFIG_REQUEST_PATH,
} from './constants';
import { cleanPath, normalizePath } from './utils';
import { SiteConfig } from './types';
import chalk from 'chalk';

export function createOnePressPlugin(
  config: SiteConfig,
  ssr: boolean
): Plugin[] {
  let { theme: themeConfig = {} } = config;

  const onepressPlugin: Plugin = {
    name: 'onepress',

    config: () => {
      const viteConfig: ViteConfig = {
        resolve: {
          alias: [
            // We alias the theme entry, and it will skip the vite-plugin-react-pages
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
            // alias for local linked development
            {
              find: /^onepress\//,
              replacement: path.resolve(__dirname, '../../') + '/',
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

  return [
    ...mdx(config.mdx),
    reactRefresh(config.reactRefresh),
    reactPages(config.reactPages),
    onepressPlugin,
  ];
}
