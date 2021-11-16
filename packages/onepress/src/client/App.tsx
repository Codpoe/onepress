import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import theme from '/@onepress/theme';
import importedThemeConfig from '/@onepress/theme-config';
import importedPagesData from '/@onepress/pages-data';
import { AppContext } from './context';
import { PageStatus } from './types';

const { Layout, NotFound, mdxComponents } = theme;

export const App: React.FC = () => {
  const [themeConfig, setThemeConfig] = useState(importedThemeConfig);
  const [pagesData, setPagesData] = useState(importedPagesData);

  const { pathname } = useLocation();
  const [pagePath, setPagePath] = useState<string>(pathname);

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const onStatusChange = useCallback((status: PageStatus) => {
    if (status === 'resolve') {
      setPagePath(pathnameRef.current);
    }
  }, []);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/theme-config', mod => {
        setThemeConfig(mod.default);
      });
    }
  }, []);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/pages-data', mod => {
        setPagesData(mod.default);
      });
    }
  }, []);

  return (
    <AppContext.Provider value={{ NotFound, onStatusChange }}>
      <MDXProvider components={mdxComponents || {}}>
        <Layout
          themeConfig={themeConfig}
          pagesData={pagesData}
          pagePath={pagePath}
        />
      </MDXProvider>
    </AppContext.Provider>
  );
};
