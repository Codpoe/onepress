import React, { useEffect, useMemo, useState } from 'react';
import { useSidebar } from '../../hooks/useSidebar';
import { useThemeContext } from '../../context';
import { usePageMatchRoute } from '../../hooks/usePageMatchRoute';
import { Items } from './Items';
import { Nav } from './Nav';
import { SidebarItem } from './types';
import styles from './style.module.less';

export const Sidebar: React.FC = () => {
  const { pagePath, nav, sidebarOpen, setSidebarOpen, setHasSidebar } =
    useThemeContext();
  const matchRoute = usePageMatchRoute();

  const sidebar = useSidebar();

  const hitItems = useMemo(() => {
    const res: SidebarItem[] = [];

    const find = (items?: SidebarItem[]) => {
      if (!items?.length) {
        return false;
      }

      for (let i = 0; i < items.length; i++) {
        res.push(items[i]);

        if (matchRoute({ to: items[i].link })) {
          return true;
        }

        if (find(items[i].items)) {
          return true;
        }

        res.pop();
      }
    };

    find(sidebar);

    return res;
  }, [sidebar, matchRoute]);

  const [activeItems, setActiveItems] = useState<SidebarItem[]>(hitItems);

  // no hit, indicating that the current path does not have a sidebar
  const hasHit = hitItems.length > 0;

  useEffect(() => {
    setActiveItems(prev => [...new Set([...prev, ...hitItems])]);
  }, [hitItems]);

  // close sidebar when path is changed
  useEffect(() => {
    setSidebarOpen(false);
  }, [pagePath, setSidebarOpen]);

  useEffect(() => {
    setHasSidebar(Boolean(hasHit || nav?.length));
  }, [hasHit, nav?.length, setHasSidebar]);

  if (!hasHit && !nav?.length) {
    return null;
  }

  return (
    <>
      <aside
        className={`flex-shrink-0 border-r border-c-divider overflow-y-auto <md:(block w-64 px-4 py-3 fixed top-16 right-full bottom-0 z-20 bg-c-bg transform transition-transform) md:(w-56 mr-9 sticky top-24) ${
          sidebarOpen ? '<md:translate-x-full' : ''
        } ${hasHit ? 'block' : 'hidden'} ${styles.sidebar}`}
      >
        <Nav />
        {hasHit && (
          <div className="text-c-text-light">
            <Items
              items={sidebar || []}
              hitItems={hitItems}
              activeItems={activeItems}
              inside={false}
              expanded={false}
              setActiveItems={setActiveItems}
            />
          </div>
        )}
      </aside>
      {sidebarOpen && (
        <div
          className="fixed top-0 bottom-0 left-0 right-0 z-10 hidden <md:block"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
