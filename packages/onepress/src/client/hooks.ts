import { useState, useEffect } from 'react';
import importedThemeConfig from '/@onepress/theme-config';
import importedPagesData from '/@onepress/pages-data';
import { PageData } from './types';

export function useThemeConfig<ThemeConfig = any>(): ThemeConfig {
  const [themeConfig, setThemeConfig] =
    useState<ThemeConfig>(importedThemeConfig);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@onepress/theme-config', mod => {
        setThemeConfig(mod.default);
      });
    }
  }, []);

  return themeConfig;
}

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
