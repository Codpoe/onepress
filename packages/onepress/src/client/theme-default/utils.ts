import { matchPath } from 'onepress/client';
import { IN_BROWSER } from './constants';
import { LocaleConfig, ThemeConfig } from './types';

/**
 * merge theme config by path
 */
export function mergeThemeConfig(
  config: ThemeConfig,
  pathname: string | undefined
): ThemeConfig {
  const foundPath =
    pathname &&
    Object.keys(config.themeConfigByPaths || {})
      .sort((a, b) => b.length - a.length)
      .find(path => {
        const _path = path.includes(':') ? path : removeTailSlash(path) + '/*';
        return matchPath(_path, pathname);
      });

  return {
    ...config,
    ...(foundPath && config.themeConfigByPaths?.[foundPath]),
  };
}

/**
 * get locales config from theme config
 */
export function getLocales(config: ThemeConfig): LocaleConfig[] {
  const res: LocaleConfig[] = [];

  const extractLocale = (localePath: string, _config: ThemeConfig = {}) => {
    const { locale, localeText = locale } = _config;

    if (locale && localeText && !res.some(item => item.locale === locale)) {
      res.push({
        locale,
        localeText,
        localePath,
      });
    }
  };

  extractLocale('/', config);

  Object.entries(config.themeConfigByPaths || {}).forEach(
    ([path, pathConfig]) => {
      extractLocale(path, pathConfig);
    }
  );

  return res;
}

export function removeTailSlash(path: string) {
  return path.replace(/\/$/, '');
}

/**
 * replace the locale prefix in pathname
 * @example '/zh/a' -> '/en/a'
 */
export function replaceLocaleInPath(
  pathname: string,
  currentLocalePath: string,
  targetLocalePath: string
) {
  currentLocalePath = removeTailSlash(currentLocalePath);
  targetLocalePath = removeTailSlash(targetLocalePath);

  if (!currentLocalePath) {
    return `${targetLocalePath}${pathname}`;
  }

  return (
    pathname.replace(new RegExp(`^${currentLocalePath}`), targetLocalePath) ||
    '/'
  );
}

export async function copyToClipboard(text: string) {
  if (IN_BROWSER && 'clipboard' in window.navigator) {
    return window.navigator.clipboard.writeText(text);
  }
}
