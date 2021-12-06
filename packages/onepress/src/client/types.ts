export interface PageRoute {
  path: string;
  component: any;
  children?: PageRoute[];
}

export interface PageData {
  basePath: string;
  routePath: string;
  filePath: string;
  filePathFromGitRoot: string;
  meta: Record<string, any>;
}

export interface PageState {
  loading: boolean;
  error?: Error;
  loadedPathname?: string;
}
