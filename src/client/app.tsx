import { createTheme } from 'vite-pages-theme-press';
import themeConfigStr from '@onepress/themeConfig';

const themeConfig = JSON.parse(themeConfigStr);

export default createTheme(themeConfig);
