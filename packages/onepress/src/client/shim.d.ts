declare module '/@onepress/routes*' {
  interface Route {
    path: string;
    component: any;
    children?: Route[];
  }

  const routes: Route[];

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
  interface Theme {
    layoutElement?: React.ReactNode;
    notFoundElement?: React.ReactNode;
    pendingElement?: React.ReactNode;
    errorElement?: React.ReactNode;
    mdxComponents?: Record<string, React.ComponentType<any>>;
  }

  const theme: Theme;

  export default theme;
}

declare module '/@onepress/theme-config*' {
  const themeConfig: any;

  export default themeConfig;
}

declare const __HASH_ROUTER__: boolean;
