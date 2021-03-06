import React, { useCallback, useEffect, useRef, useState } from 'react';
import { matchPath } from 'react-router-dom';
import { Link } from '../Link';
import { ChevronRight } from '../Icons';
import { useTheme } from '../../context';
import { SidebarItem } from './types';

export interface ItemsProps {
  items: SidebarItem[];
  hitItems: SidebarItem[];
  activeItems: SidebarItem[];
  inside: boolean;
  expanded: boolean;
  setActiveItems: React.Dispatch<React.SetStateAction<SidebarItem[]>>;
}

export const Items: React.FC<ItemsProps> = props => {
  const { items, hitItems, activeItems, inside, expanded, setActiveItems } =
    props;
  const { loadState } = useTheme();
  const elRef = useRef<HTMLUListElement>(null);
  const timerRef = useRef<any>(null);
  const [height, setHeight] = useState<number | undefined>();

  const toggleExpand = useCallback(
    (item: SidebarItem) => {
      setActiveItems(prev => {
        const res = prev.slice();
        const index = prev.indexOf(item);

        if (index >= 0) {
          res.splice(index, 1);
        } else {
          res.push(item);
        }

        return res;
      });
    },
    [setActiveItems]
  );

  useEffect(() => {
    if (!inside || !elRef.current || !window.MutationObserver) {
      return;
    }

    setHeight(elRef.current.scrollHeight);

    const observer = new window.MutationObserver(records => {
      records
        .filter(
          item => item.type === 'attributes' && item.target.nodeName === 'DIV'
        )
        .forEach(() => {
          // 如果子树有更新，把当前节点的 height 设为 auto，让这个节点能够跟着子树高度一起变化。
          setHeight(undefined);

          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          // 150ms transition 结束后，把当前节点的高度重新设置为 scrollHeight，
          // 以致于收起节点时也能有过滤动画。
          timerRef.current = setTimeout(
            () => setHeight(elRef.current!.scrollHeight),
            150
          );
        });
    });

    observer.observe(elRef.current, {
      attributes: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [inside]);

  return (
    <div
      className={`${
        inside
          ? 'ml-[7px] border-l border-c-divider transition-all overflow-hidden'
          : ''
      } ${inside && !expanded ? '!h-0' : ''}`}
      style={{ height: inside && height ? `${height}px` : 'auto' }}
    >
      <ul ref={elRef}>
        {items.map((item, index) => {
          const hit = hitItems.includes(item);
          const active = activeItems.includes(item);
          const loading =
            loadState.type === 'loading' &&
            matchPath(item.link || '', {
              path: loadState.routePath,
              exact: true,
            });

          if (item.items) {
            return (
              <li key={index} className={`${inside ? 'pl-3' : ''}`}>
                <div
                  className={`group flex items-center py-[7px] cursor-pointer transition-all ${
                    hit ? 'text-c-text font-semibold' : ''
                  }`}
                  onClick={() => toggleExpand(item)}
                >
                  <ChevronRight
                    className={`mr-2 text-sm text-c-text-lighter group-hover:text-c-brand transition-all transform ${
                      active ? 'rotate-90' : ''
                    }`}
                  />
                  {item.text}
                </div>
                <Items
                  items={item.items}
                  hitItems={hitItems}
                  activeItems={activeItems}
                  inside
                  expanded={active}
                  setActiveItems={setActiveItems}
                />
              </li>
            );
          }

          return (
            <li key={index}>
              <Link
                {...item}
                to={item.link}
                color={false}
                className={`w-full py-[7px] transition-all hover:text-c-brand ${
                  inside ? 'pl-3' : ''
                } ${hit ? 'text-c-brand font-semibold' : ''}`}
              >
                <div
                  className={`w-1 h-1 ml-1 mr-[14px] rounded-full bg-c-text-lighter animate-delay-100 ${
                    loading ? 'animate-ping' : ''
                  }`}
                ></div>
                {item.text}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
