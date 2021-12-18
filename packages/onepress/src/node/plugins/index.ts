import path from 'path';
import {
  mergeConfig,
  send,
  Plugin,
  PluginOption,
  UserConfig as ViteConfig,
  searchForWorkspaceRoot,
} from 'vite';
import react from '@vitejs/plugin-react';
import icons from 'unplugin-icons/vite';
import {
  CSR_ENTRY_PATH,
  DEFAULT_THEME_PATH,
  DIST_CLIENT_PATH,
  DIST_THEME_PATH,
  THEME_MODULE_ID,
} from '../constants';
import { cleanPath } from '../utils';
import { SiteConfig } from '../types';
import { createRoutesPlugin } from './routes';
import { createMdxPlugin } from './mdx';
import { createThemePlugin } from './theme';

function resolveFsAllow(siteConfig: SiteConfig) {
  const workspaceRoot = searchForWorkspaceRoot(siteConfig.root);

  const allowDirs = [DIST_CLIENT_PATH, DIST_THEME_PATH, workspaceRoot];

  Object.values(siteConfig.src).forEach(x => {
    if (!x.dir.startsWith(workspaceRoot)) {
      allowDirs.push(x.dir);
    }
  });

  return allowDirs;
}

export function createOnePressPlugin(
  siteConfig: SiteConfig,
  ssr: boolean
): (PluginOption | PluginOption[])[] {
  const mainPlugin: Plugin = {
    name: 'onepress:main',

    config: () => {
      const userPostcssConfig = siteConfig.vite?.css?.postcss;

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
              replacement: require.resolve('react/index.js'),
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
              replacement: require.resolve('react-dom/index.js'),
            },
            {
              find: /^react-router-dom$/,
              replacement: require.resolve('react-router-dom/index.js'),
            },
            {
              find: /^react-helmet$/,
              replacement: require.resolve('react-helmet'),
            },
            {
              find: /^@mdx-js\/react$/,
              replacement: require.resolve('@mdx-js/react/dist/esm.js'),
            },
            {
              find: /^valtio$/,
              replacement: require.resolve('valtio'),
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
          include: [
            'react',
            'react/jsx-dev-runtime',
            'react/jsx-runtime',
            'react-dom',
            'react-router-dom',
            'react-helmet',
            'valtio',
          ],
          exclude: ['onepress'],
        },
        server: {
          fs: {
            allow: resolveFsAllow(siteConfig),
          },
        },
        css: {
          postcss:
            typeof userPostcssConfig === 'string'
              ? userPostcssConfig
              : {
                  ...userPostcssConfig,
                  plugins: [
                    require('tailwindcss')(siteConfig.tailwind),
                    require('autoprefixer'),
                  ].concat(userPostcssConfig?.plugins || []),
                },
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
    <!-- <script src="https://cdn.tailwindcss.com/3.0.0"></script> -->
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
    // internal plugins
    mainPlugin,
    createRoutesPlugin({ src: siteConfig.src }),
    createMdxPlugin(siteConfig.mdx),
    createThemePlugin(siteConfig),
  ];
}
