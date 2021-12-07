import { useMemo } from 'react';
import { useLocation, matchPath } from 'onepress/client';
import { useThemeContext } from '../context';
import { SidebarItem } from '../types';

export function useSidebar() {
  const { pathname } = useLocation();
  const { sidebar } = useThemeContext();

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
