import { normalizePath, Plugin } from 'vite';
import chalk from 'chalk';
import { SiteConfig } from '../types.js';
import { THEME_CONFIG_MODULE_ID } from '../constants.js';
import { isConfigChanged, resolveConfig } from '../config.js';

export function createThemePlugin(siteConfig: SiteConfig): Plugin {
  let { themeConfig } = siteConfig;

  return {
    name: 'onepress:theme',

    resolveId(id) {
      if (id === THEME_CONFIG_MODULE_ID) {
        return id;
      }
    },

    load(id) {
      if (id === THEME_CONFIG_MODULE_ID) {
        return `export default ${JSON.stringify(themeConfig, null, 2)}`;
      }
    },

    async handleHotUpdate(ctx) {
      // handle config hmr
      const { file, server } = ctx;

      if (
        siteConfig.configPath &&
        file === normalizePath(siteConfig.configPath)
      ) {
        const newConfig = resolveConfig(siteConfig.root);
        ({ themeConfig } = newConfig);

        if (isConfigChanged(siteConfig, newConfig)) {
          console.warn(
            chalk.yellow(
              `[onepress] config has changed. Please restart the dev server.`
            )
          );
        }

        const themeConfigModule = server.moduleGraph.getModuleById(
          THEME_CONFIG_MODULE_ID
        );

        if (themeConfigModule) {
          return [themeConfigModule];
        }
      }
    },
  };
}
