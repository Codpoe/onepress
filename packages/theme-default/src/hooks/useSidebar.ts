import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useThemeContext } from '../context';
import { SidebarItem } from '../types';

export function useSidebar() {
  const { sidebar } = useThemeContext();
  const { pathname } = useLocation();

  return useMemo<SidebarItem[] | undefined>(() => {
    if (!sidebar) {
      return undefined;
    }

    if (Array.isArray(sidebar)) {
      return sidebar;
    }

    const found = Object.keys(sidebar)
      .sort((a, b) => b.length - a.length)
      .find(path => matchPath(path, pathname));

    return found ? sidebar[found] : undefined;
  }, [sidebar, pathname]);
}
