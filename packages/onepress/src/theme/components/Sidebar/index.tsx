import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, matchPath } from 'onepress/client';
import { useSidebar } from '../../hooks/useSidebar';
import { useThemeContext } from '../../context';
import { Items } from './Items';
import { Nav } from './Nav';
import { SidebarItem } from './types';
import './style.css';

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { nav, sidebarOpen, setSidebarOpen, setHasSidebar } = useThemeContext();

  const sidebar = useSidebar();

  const hitItems = useMemo(() => {
    const res: SidebarItem[] = [];

    const find = (items?: SidebarItem[]) => {
      if (!items?.length) {
        return false;
      }

      for (let i = 0; i < items.length; i++) {
        res.push(items[i]);

        if (matchPath(items[i].link || '', pathname)) {
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
  }, [pathname, sidebar]);

  const [activeItems, setActiveItems] = useState<SidebarItem[]>(hitItems);

  // no hit, indicating that the current path does not have a sidebar
  const hasHit = hitItems.length > 0;

  useEffect(() => {
    setActiveItems(prev => [...new Set([...prev, ...hitItems])]);
  }, [hitItems]);

  // close sidebar when path is changed
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    setHasSidebar(Boolean(hasHit || nav?.length));
  }, [hasHit, nav?.length, setHasSidebar]);

  if (!hasHit && !nav?.length) {
    return null;
  }

  return (
    <>
      <aside
        className={`shrink-0 border-r border-c-divider overflow-y-auto
        fixed z-20 top-16 bottom-0 right-full w-64 py-4 px-4 bg-c-bg transition-transform
        lg:sticky lg:top-16 lg:right-auto lg:h-[calc(100vh-4rem)] lg:py-8 lg:pl-0 lg:mr-8 lg:bg-transparent
        ${sidebarOpen ? 'translate-x-full' : 'lg:translate-x-0'} ${
          hasHit ? 'lg:block' : 'lg:hidden'
        }`}
      >
        <Nav />
        {hasHit && (
          <Items
            items={sidebar || []}
            hitItems={hitItems}
            activeItems={activeItems}
            inside={false}
            expanded={false}
            setActiveItems={setActiveItems}
          />
        )}
      </aside>
      {sidebarOpen && (
        <div
          className="block lg:hidden fixed top-0 bottom-0 left-0 right-0 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
