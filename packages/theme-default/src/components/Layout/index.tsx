import React, { useMemo, useState } from 'react';
import {
  useThemeConfig,
  usePagesData,
  useLocation,
  Helmet,
  matchPath,
} from 'onepress/client';
import { ThemeContext, useThemeContext } from '../../context';
import { ThemeConfig } from '../../types';
import { getLocales, mergeThemeConfig, replaceLocaleInPath } from '../../utils';
import { useLoadProgress } from '../../hooks/useLoadProgress';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { DocLayout } from '../DocLayout';
import { HomeLayout } from '../HomeLayout';

import 'virtual:windi.css';
import '../../styles/base.less';

const InternalLayout: React.FC = () => {
  const { currentPageData } = useThemeContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-screen-lg px-4 py-8 mx-auto flex">
        <Sidebar />
        <div className="flex-1 max-w-full">
          {currentPageData?.meta.home ? <HomeLayout /> : <DocLayout />}
        </div>
      </main>
    </div>
  );
};

export const Layout: React.FC = () => {
  const themeConfig = useThemeConfig<ThemeConfig>();
  const pagesData = usePagesData();
  const { pathname } = useLocation();

  const [hasSidebar, setHasSidebar] = useState<boolean | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const finalThemeConfig = useMemo(
    () => mergeThemeConfig(themeConfig, pathname),
    [themeConfig, pathname]
  );

  const currentPageData = useMemo(() => {
    const found = Object.keys(pagesData)
      .sort((a, b) => b.length - a.length)
      .find(item => matchPath(item, pathname));
    return found ? pagesData[found] : undefined;
  }, [pagesData, pathname]);

  const locales = useMemo(() => getLocales(themeConfig), [themeConfig]);

  const currentLocale = useMemo(
    () => locales.find(item => item.locale === finalThemeConfig.locale),
    [locales, finalThemeConfig]
  );

  const homePaths = useMemo(() => {
    return Object.keys(pagesData)
      .filter(path => pagesData[path].meta.home)
      .sort((pathA, pathB) => pathA.length - pathB.length);
  }, [pagesData]);

  const homePath = currentLocale
    ? homePaths.find(item => item.startsWith(currentLocale.localePath))
    : homePaths[0];

  const finalNav = useMemo(() => {
    const { nav, repo, repoText = 'GitHub' } = finalThemeConfig;
    const res = (nav || []).slice();

    // add locale switch
    if (locales.length && currentLocale) {
      res.push({
        text: currentLocale.localeText,
        items: locales.map(item => ({
          text: item.localeText,
          link: replaceLocaleInPath(
            pathname,
            currentLocale.localePath,
            item.localePath
          ),
        })),
      });
    }

    // add git repository link
    if (repo) {
      const _repo = /^[a-z]+:/i.test(repo)
        ? repo
        : `https://github.com/${repo}`;
      res.push({ link: _repo, text: repoText });
    }

    return res;
  }, [finalThemeConfig, locales, currentLocale, pathname]);

  const siteTitle = useMemo(() => {
    const pageTitle = currentPageData?.meta?.title;

    if (pageTitle && finalThemeConfig.title) {
      return `${pageTitle} | ${finalThemeConfig.title}`;
    }
    return pageTitle || finalThemeConfig.title;
  }, [finalThemeConfig, currentPageData]);

  useLoadProgress();

  useScrollToTop();

  return (
    <>
      <Helmet
        {...(currentLocale?.locale && {
          htmlAttributes: { lang: currentLocale.locale },
        })}
      >
        {siteTitle && <title>{siteTitle}</title>}
        {finalThemeConfig.description && (
          <meta name="description" content={finalThemeConfig.description} />
        )}
        {finalThemeConfig.head?.map(([tagName, tagProps, tagChildren], index) =>
          React.createElement(tagName, { ...tagProps, key: index }, tagChildren)
        )}
      </Helmet>
      <ThemeContext.Provider
        value={{
          ...finalThemeConfig,
          nav: finalNav,
          pagesData,
          currentPageData,
          locales,
          currentLocale,
          homePath,
          hasSidebar,
          setHasSidebar,
          sidebarOpen,
          setSidebarOpen,
        }}
      >
        <InternalLayout />
      </ThemeContext.Provider>
    </>
  );
};
