declare module '/@onepress/routes*' {
  import * as React from 'react';

  interface PageRoute {
    path: string;
    component: React.ComponentType<any>;
    children?: Route[];
  }

  const routes: PageRoute[];

  export default routes;
}

declare module '/@onepress/pages-data*' {
  interface PageData {
    basePath: string;
    routePath: string;
    filePath: string;
    filePathFromGitRoot: string;
    meta: Record<string, any>;
    isLayout: boolean;
    is404: boolean;
  }

  const pagesData: Record<string, PageData>;

  export default pagesData;
}

declare module '/@onepress/theme*' {
  import { ComponentType } from 'react';

  interface PageData {
    basePath: string;
    routePath: string;
    filePath: string;
    meta: Record<string, any>;
    isLayout: boolean;
    is404: boolean;
  }

  type PageStatus = 'pending' | 'fallback' | 'resolve';

  const theme: {
    Layout: ComponentType<any>;
    NotFound?: ComponentType<any>;
    mdxComponents?: Record<string, ComponentType<any>>;
  };

  export default theme;
}

declare module '/@onepress/theme-config*' {
  const themeConfig: any;

  export default themeConfig;
}

declare const __HASH_ROUTER__: boolean;

interface Window {
  __OP_SSR_DATA__?: { routePath: string; assetPath: string; pageModule?: any };
}
