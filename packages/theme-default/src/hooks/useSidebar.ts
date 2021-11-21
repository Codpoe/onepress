import { useMemo } from 'react';
import { useThemeContext } from '../context';
import { SidebarItem } from '../types';
import { usePageMatchRoute } from './usePageMatchRoute';

export function useSidebar() {
  const { sidebar } = useThemeContext();
  const matchRoute = usePageMatchRoute();

  return useMemo<SidebarItem[] | undefined>(() => {
    if (!sidebar) {
      return undefined;
    }

    if (Array.isArray(sidebar)) {
      return sidebar;
    }

    const found = Object.keys(sidebar)
      .sort((a, b) => b.length - a.length)
      .find(path => matchRoute({ to: path }));

    return found ? sidebar[found] : undefined;
  }, [sidebar, matchRoute]);
}
