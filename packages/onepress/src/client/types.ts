export interface Route {
  path: string;
  component: any;
  children?: Route[];
}

export interface PageData {
  basePath: string;
  routePath: string;
  filePath: string;
  filePathFromGitRoot: string;
  meta: Record<string, any>;
}

export type PageStatus = 'pending' | 'fallback' | 'resolve';
