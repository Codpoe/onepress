import path from 'path';
import {
  mergeConfig,
  send,
  Plugin,
  PluginOption,
  UserConfig as ViteConfig,
} from 'vite';
import react from '@vitejs/plugin-react';
import icons from 'unplugin-icons/vite';
import windicss from 'vite-plugin-windicss';
import {
  CSR_ENTRY_PATH,
  DEFAULT_THEME_PATH,
  DIST_CLIENT_PATH,
  THEME_MODULE_ID,
} from '../constants';
import { cleanPath } from '../utils';
import { SiteConfig } from '../types';
import { createRoutesPlugin } from './routes';
import { createMdxPlugin } from './mdx';
import { createThemePlugin } from './theme';

export function createOnePressPlugin(
  siteConfig: SiteConfig,
  ssr: boolean
): (PluginOption | PluginOption[])[] {
  const mainPlugin: Plugin = {
    name: 'onepress:main',

    config: () => {
      const viteConfig: ViteConfig = {
        resolve: {
          alias: [
            {
              find: /^onepress\/client$/,
              replacement: path.join(DIST_CLIENT_PATH, 'index'),
            },
            {
              find: /^onepress\/theme$/,
              replacement: DEFAULT_THEME_PATH,
            },
            // make sure it always use the same react dependency that comes with onepress itself
            {
              find: /^react$/,
              replacement: require.resolve('react'),
            },
            {
              find: /^react\/jsx-dev-runtime$/,
              replacement: require.resolve('react/jsx-dev-runtime'),
            },
            {
              find: /^react\/jsx-runtime$/,
              replacement: require.resolve('react/jsx-runtime'),
            },
            {
              find: /^react-dom$/,
              replacement: require.resolve('react-dom'),
            },
            {
              find: /^react-router-dom$/,
              replacement: require.resolve('react-router-dom/index.js'),
            },
            {
              find: /^@mdx-js\/react$/,
              replacement: require.resolve('@mdx-js/react/dist/esm.js'),
            },
            {
              find: THEME_MODULE_ID,
              replacement: siteConfig.themePath,
            },
          ],
        },
        define: {
          __HASH_ROUTER__: Boolean(siteConfig.useHashRouter),
        },
        optimizeDeps: {
          include: ['react', 'react-dom'],
          exclude: ['onepress'],
        },
      };

      return siteConfig.vite
        ? mergeConfig(siteConfig.vite, viteConfig)
        : viteConfig;
    },

    configureServer(server) {
      if (siteConfig.configPath) {
        server.watcher.add(siteConfig.configPath);
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
    <div id="app"></div>
    <script type="module" src="/@fs/${CSR_ENTRY_PATH}"></script>
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

    resolveId(source) {
      if (source === 'react') {
        return require.resolve('react');
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
  const userVitePlugins = siteConfig.vite?.plugins?.flatMap(item => item);

  return [
    userVitePlugins,
    react(siteConfig.react),
    icons(siteConfig.icons),
    windicss(siteConfig.windicss),
    // internal plugins
    mainPlugin,
    createRoutesPlugin({ src: siteConfig.src }),
    createMdxPlugin(siteConfig.mdx),
    createThemePlugin(siteConfig),
  ];
}
