import path from 'path';
import { Page, Route } from '../../types';
import { getGitRoot, slash } from '../../utils';

interface ParentRoute extends Route {
  children: Route[];
}

export function generateRoutes(pages: Record<string, Page>): Route[] {
  const sortedPages = Object.values(pages).sort((a, b) => {
    if (a.routePath === b.routePath) {
      return a.isLayout ? -1 : 0;
    }
    return a.routePath.localeCompare(b.routePath);
  });

  const allRoutes: Route[] = [];
  const parentRouteStack: ParentRoute[] = [];

  sortedPages.forEach(page => {
    const route: Route = {
      path: page.routePath,
      component: page.filePath,
      children: page.isLayout ? [] : undefined,
    };

    while (parentRouteStack.length) {
      const parentRoute = parentRouteStack[parentRouteStack.length - 1];

      if (
        parentRoute.path === '/' ||
        parentRoute.path === route.path ||
        route.path.startsWith(`${parentRoute.path}/`)
      ) {
        parentRoute.children.push(route);
        break;
      }

      parentRouteStack.pop();
    }

    if (!parentRouteStack.length) {
      allRoutes.push(route);
    }

    if (route.children) {
      parentRouteStack.push(route as ParentRoute);
    }
  });

  return allRoutes;
}

export function generateRoutesCode(routes: Route[], ssr?: boolean) {
  const imports: string[] = [`import * as React from 'react';`];
  let index = 0;

  const routesStr = JSON.stringify(routes, null, 2).replace(
    /"component":\s("(.*?)")/g,
    (str: string, replaceStr: string, component: string) => {
      if (ssr) {
        const name = `__route_${index++}`;
        const importStr = `import ${name} from '${component}';`;

        if (!imports.includes(importStr)) {
          imports.push(importStr);
        }

        return str.replace(replaceStr, name);
      }

      return str.replace(replaceStr, `dynamic(() => import('${component}'))`);
    }
  );

  return `${imports.join('\n')}

function dynamic(factory) {
  factory._dynamic = true;
  return factory;
}

export const routes = ${routesStr};
export default routes;
`;
}

export function generatePagesData(pages: Record<string, Page>, root: string) {
  const pagesData = Object.values(pages).reduce<Record<string, Page>>(
    (acc, cur) => {
      // skip layout file and 404 file
      if (cur.isLayout || cur.is404) {
        return acc;
      }

      // get relative path from vite root
      const filePath = slash(path.relative(root, cur.filePath));

      // get relative path from git root. It will be used to create git edit link
      // e.g. https://github.com/codpoe/onepress/edit/master/package.json
      const gitRoot = getGitRoot(cur.filePath);
      const filePathFromGitRoot = gitRoot
        ? slash(path.relative(gitRoot, cur.filePath))
        : '';

      acc[cur.routePath] = {
        ...cur,
        filePath,
        filePathFromGitRoot,
      };
      return acc;
    },
    {}
  );

  return `
export const pagesData = ${JSON.stringify(pagesData, null, 2)};
export default pagesData;`;
}
