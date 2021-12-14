import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, Outlet, useLocation } from 'react-router-dom';
import importedRoutes from '/@onepress/routes';
import { useAppState } from './context';
import { PageRoute } from './types';

interface ComponentFactory {
  (): Promise<{ default: React.ComponentType<any> }>;
  _dynamic: true;
  _result?: { default: React.ComponentType<any> };
}

const isDynamicComponent = (component: any): component is ComponentFactory =>
  component._dynamic || false;

const PageLoader: React.FC<{
  routePath: string;
  component: React.ComponentType<any> | ComponentFactory;
  isLayout: boolean;
  fallback?: React.ReactNode;
  timeout?: number;
  fallbackMinMs?: number;
}> = ({
  routePath,
  component: Component,
  isLayout,
  fallback,
  timeout,
  fallbackMinMs,
}) => {
  const [
    {
      pageState: { loading },
    },
    appState,
  ] = useAppState();

  const [pageModule, setPageModule] = useState(() => {
    if (isDynamicComponent(Component)) {
      if (
        typeof window !== 'undefined' &&
        routePath === window.__OP_SSR_DATA__?.routePath &&
        window.__OP_SSR_DATA__.pageModule
      ) {
        Component._result = window.__OP_SSR_DATA__.pageModule;
      }
      return Component._result;
    }
    return { default: Component };
  });

  const finalComponentRef = useRef(pageModule?.default);
  if (pageModule?.default && pageModule.default !== finalComponentRef.current) {
    finalComponentRef.current = pageModule.default;
  }

  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const updatePageModule = (mod: { default: React.ComponentType<any> }) => {
      setPageModule(mod);
      appState.pageState.loading = false;
      appState.pageState.error = undefined;
      appState.pageState.loadedPathname = pathnameRef.current;
    };

    // load dynamic page module
    if (isDynamicComponent(Component)) {
      // use cache
      if (Component._result) {
        updatePageModule(Component._result);
        return;
      }

      let isDestroyed = false;
      appState.pageState.loading = true;

      Component()
        .then(mod => {
          if (isDestroyed) {
            return;
          }

          if (!mod.default) {
            const msg = 'Page module miss default export.';
            console.error(msg, mod);
            throw new Error(msg);
          }

          updatePageModule(mod);
          // cache page module
          Component._result = mod;
        })
        .catch(err => {
          if (isDestroyed) {
            return;
          }
          appState.pageState.error = err;
          appState.pageState.loading = false;
        });

      return () => {
        isDestroyed = true;
      };
    } else {
      // sync component. in ssr
      updatePageModule({ default: Component });
    }
  }, [Component, isLayout, appState]);

  useEffect(() => {
    if (typeof timeout === 'number') {
      if (loading) {
        if (timeout && finalComponentRef.current) {
          const timer = setTimeout(() => {
            setShowFallback(true);
          }, timeout);
          return () => {
            clearTimeout(timer);
          };
        } else {
          setShowFallback(true);
        }
      }

      if (fallbackMinMs) {
        const timer = setTimeout(() => {
          setShowFallback(false);
        }, fallbackMinMs);
        return () => {
          clearTimeout(timer);
        };
      } else {
        setShowFallback(false);
      }
    }
  }, [loading, timeout, fallbackMinMs]);

  if (showFallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {finalComponentRef.current && (
        <finalComponentRef.current>
          {isLayout ? <Outlet /> : undefined}
        </finalComponentRef.current>
      )}
    </>
  );
};

/**
 * get routes
 */
export function useRoutes(): PageRoute[] {
  const [routes, setRoutes] = useState(importedRoutes);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/routes', mod => {
        setRoutes(mod.default);
      });
    }
  }, []);

  return routes;
}

export interface PageProps {
  fallback?: React.ReactNode;
  timeout?: number;
  fallbackMinMs?: number;
}

/**
 * Render page content.
 */
export const Page: React.FC<PageProps> = ({
  fallback,
  timeout,
  fallbackMinMs,
}) => {
  const [{ NotFound }] = useAppState();
  const routes = useRoutes();

  const renderRoutes = (routes: PageRoute[]) => {
    return routes.map(item => {
      const isLayout = Boolean(item.children?.length);

      return (
        <Route
          key={item.path}
          path={item.path}
          element={
            <PageLoader
              routePath={item.path}
              component={item.component}
              isLayout={isLayout}
              fallback={fallback}
              timeout={timeout}
              fallbackMinMs={fallbackMinMs}
            ></PageLoader>
          }
        >
          {isLayout ? renderRoutes(item.children!) : undefined}
        </Route>
      );
    });
  };

  return (
    <Routes>
      {renderRoutes(routes)}
      {NotFound && <Route path="*" element={<NotFound />} />}
    </Routes>
  );
};
