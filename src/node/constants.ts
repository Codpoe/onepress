import path from 'path';

// This is the app entry used in vite-plugin-react-pages,
// we will use it as an entry for our custom html
export const REACT_PAGES_APP_ENTRY = '/@pages-infra/main.js';

// This is the theme entry used in vite-plugin-react-pages,
// we will proxy it
export const REACT_PAGES_THEME_ENTRY = '/@react-pages/theme';

// This is the pages module used in vite-plugin-react-pages
export const REACT_PAGES_MODULE_ID = '/@react-pages/pages';

export const DEFAULT_THEME_PATH = path.resolve(__dirname, '../client/app');

// special virtual file
// we can't directly import '@onepress/themeConfig' because
// - it's not an actual file so we can't use tsconfig paths to redirect it
// - TS doesn't allow shimming a module that starts with '/'
export const THEME_CONFIG_ID = '@onepress/themeConfig';
export const THEME_CONFIG_REQUEST_PATH = `/${THEME_CONFIG_ID}`;

export const POSSIBLE_CONFIG_FILES = ['config.js', 'config.ts'];

export const POSSIBLE_THEME_FILES = [
  'theme.js',
  'theme.ts',
  'theme.jsx',
  'theme.tsx',
];
