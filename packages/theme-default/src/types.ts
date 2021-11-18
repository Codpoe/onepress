import React from 'react';

export interface NavItem {
  [key: string]: any;
  text: string;
  link?: string;
  items?: NavItem[];
}

export interface SidebarItem {
  [key: string]: any;
  text: string;
  link?: string;
  items?: SidebarItem[];
}

export interface LocaleConfig {
  locale: string;
  localeText: string;
  localePath: string;
}

export interface ThemeConfig {
  [key: string]: any;
  locale?: string;
  localeText?: string;
  logo?: string;
  title?: string;
  description?: string;
  head?: React.ReactNode;
  nav?: NavItem[];
  sidebar?: SidebarItem[] | Record<string, SidebarItem[]>;
  banner?: React.ReactNode;
  repo?: string;
  repoText?: string;
  docsRepo?: string;
  docsDir?: string;
  docsBranch?: string;
  editLink?: boolean | string;
  lastUpdated?: boolean | string;
  algolia?: {
    [key: string]: any;
    apiKey: string;
    indexName: string;
    appId?: string;
    algoliaOptions?: Record<string, any>;
  };
  themeConfigByPaths?: Record<string, ThemeConfig>;
}
