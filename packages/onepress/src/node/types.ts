import { UserConfig as ViteConfig } from 'vite';
import { Options as ReactRefreshOptions } from '@vitejs/plugin-react-refresh';
import { MdxOptions } from 'vite-plugin-mdx';
import createReactPagesPlugin from 'vite-plugin-react-pages';
import { ThemeOptions } from 'vite-pages-theme-press';
import { UserOptions as WindiCssUserOptions } from 'vite-plugin-windicss';

type ReactPagesOptions = Parameters<typeof createReactPagesPlugin>[0];

export interface UserConfig {
  base?: string;
  srcDir?: string;
  outDir?: string;
  theme?: ThemeOptions;
  vite?: ViteConfig;
  mdx?: MdxOptions;
  windicss?: WindiCssUserOptions;
  reactRefresh?: ReactRefreshOptions;
  reactPages?: ReactPagesOptions;
}

export interface SiteConfig extends UserConfig {
  root: string;
  configPath?: string;
  base: string;
  themePath: string;
  theme: ThemeOptions;
  outDir: string;
  tempDir: string;
  windicss: WindiCssUserOptions;
  reactPages: ReactPagesOptions;
}

export interface GitContributor {
  name: string;
  email: string;
  commits: number;
}
