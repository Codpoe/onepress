import path from 'path';
import { fileURLToPath } from 'url';
import jiti from 'jiti';
import { TailwindOptions } from './types.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const _require = jiti(filename, { requireCache: false, cache: false });

export const DIST_CLIENT_PATH = path.join(dirname, '../client');
export const CSR_ENTRY_PATH = path.join(
  DIST_CLIENT_PATH,
  'app/entry.client.js'
);
export const SSR_ENTRY_PATH = path.join(
  DIST_CLIENT_PATH,
  'app/entry.server.js'
);

// routes
export const ROUTES_MODULE_ID = '/@onepress/routes';

// pages data
export const PAGES_DATA_MODULE_ID = '/@onepress/pages-data';

// mdx demo
export const MDX_DEMO_RE = /<Demo\s+src=["'](.*?)["']/;
export const DEMO_MODULE_ID_PREFIX = '/@onepress/demo/';

// mdx tsInfo
export const MDX_TS_INFO_RE =
  /<TsInfo\s+src=["'](.*?)["']\s+name=["'](.*?)["']/;
export const TS_INFO_MODULE_ID_PREFIX = '/@onepress/ts-info/';

// theme
export const THEME_MODULE_ID = '/@onepress/theme';
export const THEME_CONFIG_MODULE_ID = '/@onepress/theme-config';
export const DIST_THEME_PATH = path.join(dirname, '../theme');
export const DEFAULT_THEME_PATH = path.join(DIST_THEME_PATH, 'index.ts');
export const DEFAULT_THEME_TAILWIND_CONFIG: TailwindOptions = _require(
  '../../tailwind.config.js'
);

export const SLIDE_MODULE_ID_PREFIX = '/@onepress/slide/';

export const POSSIBLE_CONFIG_FILES = ['config.js', 'config.ts'];

export const POSSIBLE_THEME_FILES = [
  'theme.js',
  'theme.ts',
  'theme.jsx',
  'theme.tsx',
];
