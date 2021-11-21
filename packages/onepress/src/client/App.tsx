import React, { useEffect, useState, useMemo } from 'react';
import { Router, ReactLocation, RouteMatch, Route } from 'react-location';
import { rankRoutes } from 'react-location-rank-routes';
import { MDXProvider } from '@mdx-js/react';
import theme from '/@onepress/theme';
import importedRoutes from '/@onepress/routes';
import { ServerRoute } from './types';

export interface AppProps {
  location: ReactLocation;
  initialMatches?: RouteMatch[];
}

export const App: React.FC<AppProps> = ({ location, initialMatches }) => {
  const [routes, setRoutes] = useState(importedRoutes);

  const {
    layoutElement,
    pendingElement,
    errorElement,
    notFoundElement = '404 Not Found',
    mdxComponents,
  } = theme;

  const parsedRoutes = useMemo(() => {
    function parse(routes: ServerRoute[]): Route[] {
      return routes.map(item => {
        const result: Route = { path: item.path };

        // if ssr, `item.component` is just a react component,
        // else it is a dynamic import, eg. `() => import('./Home.tsx')`
        if (import.meta.env.SSR) {
          result.element = <item.component />;
        } else {
          result.import = () =>
            item.component().then(
              (mod: any): Route => ({
                element: mod?.default && <mod.default />,
                ...mod,
              })
            );
        }

        if (item.children?.length) {
          result.children = parse(item.children);
        }

        return result;
      });
    }

    const _parsedRoutes = parse(routes);

    _parsedRoutes.push({
      path: '*',
      element: notFoundElement,
    });

    return _parsedRoutes;
  }, [routes, notFoundElement]);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/routes', mod => {
        setRoutes(mod.default);
      });
    }
  }, []);

  return (
    <Router
      location={location}
      basepath={import.meta.env.BASE_URL}
      initialMatches={initialMatches}
      defaultPendingElement={pendingElement}
      defaultErrorElement={errorElement}
      routes={parsedRoutes}
      filterRoutes={rankRoutes}
    >
      <MDXProvider components={mdxComponents || {}}>
        {layoutElement}
      </MDXProvider>
    </Router>
  );
};
