import { useState, useEffect } from 'react';
import importedThemeConfig from '/@onepress/theme-config';
import importedPagesData from '/@onepress/pages-data';
import { useAppState } from './context';
import { PageData, PageState } from './types';

/**
 * get theme config
 */
export function useThemeConfig<T = any>(): T {
  const [themeConfig, setThemeConfig] = useState(importedThemeConfig);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/theme-config', mod => {
        setThemeConfig(mod.default);
      });
    }
  }, []);

  return themeConfig;
}

/**
 * get pages data
 */
export function usePagesData(): Record<string, PageData> {
  const [pagesData, setPagesData] = useState(importedPagesData);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/pages-data', mod => {
        setPagesData(mod.default);
      });
    }
  }, []);

  return pagesData;
}

/**
 * get page state
 */
export function usePageState(): PageState {
  return useAppState()[0].pageState;
}
