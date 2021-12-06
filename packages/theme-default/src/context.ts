import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { PageData } from 'onepress/client';
import { LocaleConfig, ThemeConfig } from './types';

export interface ThemeContextValue extends ThemeConfig {
  pagesData: Record<string, PageData>;
  currentPageData: PageData | undefined;
  locales: LocaleConfig[];
  currentLocale?: LocaleConfig;
  homePath?: string;
  hasSidebar: boolean | undefined;
  setHasSidebar: Dispatch<SetStateAction<boolean | undefined>>;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const ThemeContext = createContext<ThemeContextValue>({} as any);

export const useThemeContext = () => useContext(ThemeContext);
