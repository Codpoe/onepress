import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { LoadState, PagesLoaded } from 'vite-plugin-react-pages/clientTypes';
import { LocaleOption, ThemeOptions } from './types';

export interface ThemeContextValue extends ThemeOptions {
  base: string;
  useHashRouter: boolean;
  loadState: LoadState;
  loadedData: PagesLoaded;
  loadedRoutePath?: string;
  staticData: Record<string, any>;
  hasSidebar: boolean | undefined;
  setHasSidebar: Dispatch<SetStateAction<boolean | undefined>>;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  homePath?: string;
  blogPaths: string[];
  locales: LocaleOption[];
  currentLocale?: LocaleOption;
}

export const ThemeContext = createContext<ThemeContextValue>({} as any);

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => useContext(ThemeContext);
