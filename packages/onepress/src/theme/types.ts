import { DocSearchProps } from '@docsearch/react';

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

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

export interface ThemeConfig {
  [key: string]: any;
  locale?: string;
  localeText?: string;
  logo?: string;
  title?: string;
  description?: string;
  head?: HeadConfig[];
  nav?: NavItem[];
  sidebar?: SidebarItem[] | Record<string, SidebarItem[]>;
  repo?: string;
  repoText?: string;
  docsRepo?: string;
  docsDir?: string;
  docsBranch?: string;
  editLink?: boolean | string;
  lastUpdated?: boolean | string;
  algolia?: DocSearchProps;
  themeConfigByPaths?: Record<string, ThemeConfig>;
}
