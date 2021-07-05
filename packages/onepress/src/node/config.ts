import path from 'path';
import fs from 'fs-extra';
import jiti from 'jiti';
import pick from 'lodash/pick';
import { PressPageStrategy } from './pageStrategy';
import { UserConfig, SiteConfig } from './types';
import {
  DEFAULT_THEME_PATH,
  POSSIBLE_THEME_FILES,
  POSSIBLE_CONFIG_FILES,
} from './constants';

const _require = jiti(__filename, { requireCache: false, cache: false });

function resolveInOnePress(root: string, targetPath: string) {
  return path.resolve(root, '.onepress', targetPath);
}

export function resolveThemePath(root: string) {
  for (const item of POSSIBLE_THEME_FILES) {
    const themePath = resolveInOnePress(root, item);

    if (fs.pathExistsSync(themePath)) {
      return themePath;
    }
  }

  return DEFAULT_THEME_PATH;
}

export function loadUserConfig(root: string): {
  configPath?: string;
  userConfig: UserConfig;
} {
  let configPath: string | undefined;
  let userConfig: any = {};

  for (const configFile of POSSIBLE_CONFIG_FILES) {
    const tryPath = resolveInOnePress(root, configFile);

    if (fs.pathExistsSync(tryPath)) {
      configPath = tryPath;
      break;
    }
  }

  if (configPath) {
    userConfig = _require(configPath);

    if (userConfig.default) {
      userConfig = userConfig.default;
    }
  }

  return {
    configPath,
    userConfig,
  };
}

export async function resolveConfig(root: string): Promise<SiteConfig> {
  const { configPath, userConfig } = loadUserConfig(root);
  const { reactPages } = userConfig;
  const outDir = path.resolve(root, userConfig.outDir || 'dist');

  return {
    ...userConfig,
    root,
    configPath,
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    outDir,
    tempDir: path.resolve(outDir, '.temp'),
    themePath: resolveThemePath(root),
    theme: {
      title: 'OnePress',
      description: 'An OnePress site',
      ...userConfig.theme,
    },
    reactPages: {
      pageStrategy: new PressPageStrategy(),
      ...reactPages,
      pagesDir: path.resolve(root, userConfig.srcDir || '.'),
    },
    mdx: {
      ...userConfig.mdx,
      remarkPlugins: (userConfig.mdx?.remarkPlugins || []).concat(
        require('remark-slug')
      ),
    },
  };
}

const compareFields = [
  'base',
  'srcDir',
  'vite',
  'mdx',
  'reactRefresh',
  'reactPages',
];
const ignoreFields = ['pageStrategy'];

export function isConfigChanged(
  oldConfig: SiteConfig,
  newConfig: SiteConfig
): boolean {
  let hasError = false;

  function stringify(config: SiteConfig) {
    try {
      return JSON.stringify(
        pick(config, compareFields),
        (key: string, value: any) => {
          if (ignoreFields.includes(key)) {
            return undefined;
          }
          return value;
        }
      );
    } catch (e) {
      hasError = true;
      return '';
    }
  }

  // When an error occurs, the config is assumed to have changed
  return hasError || stringify(oldConfig) !== stringify(newConfig);
}
