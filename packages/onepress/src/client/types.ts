import React from 'react';

export interface ServerRoute {
  path: string;
  component: any;
  children?: ServerRoute[];
}

export interface PageData {
  basePath: string;
  routePath: string;
  filePath: string;
  filePathFromGitRoot: string;
  meta: Record<string, any>;
}

export interface Theme {
  layoutElement?: React.ReactNode;
  notFoundElement?: React.ReactNode;
  pendingElement?: React.ReactNode;
  errorElement?: React.ReactNode;
  mdxComponents?: Record<string, React.ComponentType<any>>;
}
