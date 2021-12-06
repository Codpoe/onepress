import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { proxy, ref } from 'valtio';
import { MDXProvider } from '@mdx-js/react';
import theme from '/@onepress/theme';
import { AppStateContext, AppState } from './context';

const { Layout, NotFound, mdxComponents } = theme;

export const App: React.FC = () => {
  const { pathname } = useLocation();
  const appStateRef = useRef<AppState>();

  if (!appStateRef.current) {
    appStateRef.current = proxy<AppState>({
      NotFound: ref(NotFound || (() => <>404 Not Found</>)),
      pageState: {
        loading: false,
        loadedPathname: import.meta.env.SSR ? pathname : undefined,
      },
    });
  }

  return (
    <AppStateContext.Provider value={appStateRef.current}>
      <MDXProvider components={mdxComponents || {}}>
        <Layout />
      </MDXProvider>
    </AppStateContext.Provider>
  );
};
