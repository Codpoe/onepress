import { UserConfig as ViteConfig } from 'vite';
import { Options as ReactOptions } from '@vitejs/plugin-react';
import { UserOptions as WindiCssOptions } from 'vite-plugin-windicss';
import { Options as IconsOptions } from 'unplugin-icons';

export interface Page {
  basePath: string;
  routePath: string;
  filePath: string;
  filePathFromGitRoot?: string;
  meta: Record<string, any>;
  isLayout: boolean;
  is404: boolean;
}

export interface Route {
  path: string;
  component: any;
  children?: Route[];
}

export interface SrcObject {
  dir: string;
  /**
   * Glob patterns for tracking.
   * @default '**\/*{.md,.mdx,.page.js,.page.jsx,.page.ts,.page.tsx}'
   */
  glob?: string | string[];
  /**
   * Defines files/paths to be ignored.
   */
  ignored?: any;
}

export type SrcConfig = string | SrcObject | Record<string, string | SrcObject>;

export type ResolvedSrcConfig = Record<string, Required<SrcObject>>;

export interface MdxOptions {
  remarkPlugins?: any[];
  rehypePlugins?: any[];
}

export interface UserConfig<ThemeConfig = any> {
  /**
   * Theme config
   */
  themeConfig?: ThemeConfig;
  /**
   * Source config
   * @default 'docs'
   */
  src?: SrcConfig;
  /**
   * Defines files/paths to be ignored.
   */
  ignored?: any;
  useHashRouter?: boolean;
  /**
   * Vite config
   */
  vite?: ViteConfig;
  /**
   * Options to pass on to `@vitejs/plugin-react`
   */
  react?: ReactOptions;
  /**
   * Options to pass on to mdx compiler
   */
  mdx?: MdxOptions;
  /**
   * Options to pass on to `vite-plugin-windicss`
   */
  windicss?: WindiCssOptions;
  /**
   * Options to pass on to `unplugin-icons`
   */
  icons?: IconsOptions;
}

export interface SiteConfig<ThemeConfig = any> extends UserConfig<ThemeConfig> {
  configPath?: string;
  root: string;
  base: string;
  outDir: string;
  tempDir: string;
  themePath: string;
  themeConfig: ThemeConfig;
  src: ResolvedSrcConfig;
  windicss: WindiCssOptions;
  icons: IconsOptions;
}

export interface GitContributor {
  name: string;
  email: string;
  commits: number;
}

export interface Slide {
  content: string;
}
