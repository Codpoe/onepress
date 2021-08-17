import React from 'react';
import { matchPath } from 'react-router-dom';
import { BaseLayout } from './components/BaseLayout';
import { HomeLayout } from './components/HomeLayout';
import { DocLayout } from './components/DocLayout';
import { BlogLayout } from './components/BlogLayout';
import { SlideLayout } from './components/SlideLayout';
import { ThemeOptions, LocaleOption } from './types';
import { IN_BROWSER } from './constants';

export function getLayout(staticDataPart: Record<string, any> = {}) {
  const { layout, home, blog, slide, sourceType } = staticDataPart;

  if (home) {
    return HomeLayout;
  }

  if (blog) {
    return BlogLayout;
  }

  if (slide) {
    return SlideLayout;
  }

  if (layout === false || layout === 'false') {
    return React.Fragment;
  }

  if (sourceType === 'md') {
    return DocLayout;
  }

  return BaseLayout;
}

export function mergeThemeOptions(
  options: ThemeOptions,
  pathname?: string
): ThemeOptions {
  const foundPath = Object.keys(options.themeOptionsByPaths || {})
    .sort((a, b) => b.length - a.length)
    .find(path => pathname && matchPath(pathname, path));
  return {
    ...options,
    ...(foundPath && options.themeOptionsByPaths?.[foundPath]),
  };
}

export function getLocales(options: ThemeOptions): LocaleOption[] {
  const res: LocaleOption[] = [];

  const extractLocale = (localePath: string, options: ThemeOptions = {}) => {
    const { locale, localeText = locale } = options;

    if (locale && localeText) {
      res.push({
        locale,
        localeText,
        localePath,
      });
    }
  };

  extractLocale('/', options);

  Object.entries(options.themeOptionsByPaths || {}).forEach(
    ([path, pathOptions]) => {
      extractLocale(path, pathOptions);
    }
  );

  return res;
}

export function removeTailSlash(path: string) {
  return path.replace(/\/$/, '');
}

export function replaceLocaleInPath(
  path: string,
  currentLocalePath: string,
  targetLocalePath: string
) {
  currentLocalePath = removeTailSlash(currentLocalePath);
  targetLocalePath = removeTailSlash(targetLocalePath);

  if (!currentLocalePath) {
    return `${targetLocalePath}${path}`;
  }

  return (
    path.replace(new RegExp(`^${currentLocalePath}`), targetLocalePath) || '/'
  );
}

export async function copyToClipboard(text: string) {
  if (IN_BROWSER && 'clipboard' in window.navigator) {
    return window.navigator.clipboard.writeText(text);
  }
}
