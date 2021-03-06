import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import jiti from 'jiti';
import _ from 'lodash';
import remarkSlug from 'remark-slug';
import {
  UserConfig,
  SiteConfig,
  ResolvedSrcConfig,
  SrcConfig,
  SrcObject,
  TailwindOptions,
} from './types.js';
import {
  DEFAULT_THEME_PATH,
  DEFAULT_THEME_TAILWIND_CONFIG,
  POSSIBLE_CONFIG_FILES,
} from './constants.js';
import { ensureLeadingSlash, removeTrailingSlash, slash } from './utils.js';

const _require = jiti(path.dirname(fileURLToPath(import.meta.url)), {
  requireCache: false,
  cache: false,
});

/**
 * Type helper to make it easier to create onepress config
 */
export function defineConfig<ThemeConfig = any>(
  config: UserConfig<ThemeConfig>
) {
  return config;
}

function resolveInOnePress(root: string, targetPath: string) {
  return path.resolve(root, '.onepress', targetPath);
}

export function resolveThemePath(root: string) {
  const userThemePath = resolveInOnePress(root, 'theme');
  return fs.pathExistsSync(userThemePath) ? userThemePath : DEFAULT_THEME_PATH;
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

function checkIsPagesObject(src: SrcConfig): src is SrcObject {
  return typeof src === 'object' && 'dir' in src;
}

export function resolveSrcConfig(
  src: SrcConfig = 'docs',
  defaultIgnored: any = [],
  root = slash(process.cwd()),
  base = '/'
): ResolvedSrcConfig {
  if (typeof src === 'string' || checkIsPagesObject(src)) {
    src = {
      [base]: src,
    };
  }

  return Object.entries(src).reduce<ResolvedSrcConfig>(
    (res, [baseRoutePath, config]) => {
      baseRoutePath = removeTrailingSlash(ensureLeadingSlash(baseRoutePath));

      if (typeof config === 'string') {
        config = {
          dir: config,
        };
      }

      const ignored = config.ignored || defaultIgnored || [];

      res[baseRoutePath] = {
        dir: path.resolve(root, config.dir),
        glob:
          config.glob || '**/*{.md,.mdx,.page.js,.page.jsx,.page.ts,.page.tsx}',
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          ...(Array.isArray(ignored) ? ignored : [ignored]),
        ],
      };

      return res;
    },
    {}
  );
}

function resolveTailwindConfig(
  src: ResolvedSrcConfig,
  userTailwind: TailwindOptions | string = 'tailwind.config.js',
  useDefaultTheme: boolean,
  root: string
): TailwindOptions {
  const userTailwindConfigPath =
    typeof userTailwind === 'string' && path.resolve(root, userTailwind);

  const userTailwindOptions: TailwindOptions | undefined =
    userTailwindConfigPath && fs.pathExistsSync(userTailwindConfigPath)
      ? _require(userTailwindConfigPath)
      : userTailwind;

  const content = Object.values(src)
    .map(
      srcObject => `${slash(srcObject.dir)}/**/*.{html,md,mdx,js,jsx,ts,tsx}`
    )
    .concat(
      slash(resolveInOnePress(root, '**/*.{js,jsx,ts,tsx}')),
      userTailwindOptions?.content || [],
      // inject content of default theme
      useDefaultTheme ? DEFAULT_THEME_TAILWIND_CONFIG.content || [] : []
    );

  return {
    ...userTailwindOptions,
    content,
    darkMode: useDefaultTheme
      ? 'class'
      : userTailwindOptions?.darkMode || 'class',
    theme: {
      ...userTailwindOptions?.theme,
      extend: {
        ...userTailwindOptions?.theme?.extend,
        screens: {
          ...userTailwindOptions?.theme?.extend?.screens,
          ...(useDefaultTheme &&
            DEFAULT_THEME_TAILWIND_CONFIG.theme?.extend?.screens),
        },
        colors: {
          ...userTailwindOptions?.theme?.extend?.colors,
          // inject colors of default theme
          ...(useDefaultTheme &&
            DEFAULT_THEME_TAILWIND_CONFIG.theme?.extend?.colors),
        },
      },
    },
  };
}

export function resolveConfig(root: string): SiteConfig {
  const { configPath, userConfig } = loadUserConfig(root);

  const base = userConfig.vite?.base || '/';
  const outDir = path.resolve(root, userConfig.vite?.build?.outDir || 'dist');
  const themePath = resolveThemePath(root);
  const useDefaultTheme = themePath === DEFAULT_THEME_PATH;

  const src = resolveSrcConfig(userConfig.src, userConfig.ignored, root, base);

  return {
    ...userConfig,
    configPath,
    root,
    base,
    outDir,
    tempDir: path.resolve(outDir, '.temp'),
    themePath,
    themeConfig: {
      title: 'OnePress',
      description: 'An OnePress site',
      ...userConfig.themeConfig,
    },
    src,
    mdx: {
      ...userConfig.mdx,
      remarkPlugins: [...(userConfig.mdx?.remarkPlugins || []), remarkSlug],
    },
    tailwind: resolveTailwindConfig(
      src,
      userConfig.tailwind,
      useDefaultTheme,
      root
    ),
    icons: {
      compiler: 'jsx',
      autoInstall: true,
      scale: 1,
      ...userConfig.icons,
    },
  };
}

const compareFields: string[] = [
  'base',
  'src',
  'ignored',
  'vite',
  'react',
  'mdx',
  'tailwind',
  'icons',
];
const ignoreFields: string[] = [];

export function isConfigChanged(
  oldConfig: SiteConfig,
  newConfig: SiteConfig
): boolean {
  let hasError = false;

  function stringify(config: SiteConfig) {
    try {
      return JSON.stringify(
        _.pick(config, compareFields),
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
