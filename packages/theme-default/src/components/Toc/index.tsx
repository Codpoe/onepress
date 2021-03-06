import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import debounce from 'lodash/debounce';
import { useHash } from '../../hooks/useHash';
import { useScroll } from '../../hooks/useScroll';
import { useMutation } from '../../hooks/useMutation';
import { IN_BROWSER } from '../../constants';
import { Link } from '../Link';

export const Toc: React.FC = () => {
  const [headings, setHeadings] = useState<HTMLElement[]>([]);
  const [hit, setHit] = useState<HTMLElement>();
  const hash = useHash();
  const elRef = useRef<HTMLDivElement>(null);

  // hit -> active
  const active = useMemo(() => {
    if (!hit || !headings.length) {
      return [];
    }

    let res: (HTMLElement | null)[] = [];

    for (let i = 0; i < headings.length; i++) {
      const prevLevel = res.length
        ? Number(res[res.length - 1]?.tagName.substring(1, 2) || 0)
        : 0;
      const curLevel = Number(headings[i].tagName.substring(1, 2));

      const diff = curLevel - prevLevel;
      let pushCount = diff > 0 ? diff : 1;
      let popCount = diff <= 0 ? Math.abs(diff) + 1 : 0;

      while (popCount--) {
        res.pop();
      }

      while (pushCount--) {
        res.push(pushCount === 0 ? headings[i] : null);
      }

      if (headings[i] === hit) {
        break;
      }

      // 如果最后一个都不能匹配上，置空 res
      if (i === headings.length - 1) {
        res = [];
      }
    }

    return res.filter(Boolean);
  }, [hit, headings]);

  const updateHeadings = useCallback(() => {
    if (IN_BROWSER && elRef.current) {
      const markdownBody = document.querySelector('.markdown-body');
      const newHeadings = Array.prototype.slice.call(
        markdownBody?.querySelectorAll('h2,h3') || []
      ) as HTMLElement[];

      setHeadings(newHeadings);
      setHit(undefined);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    debounce(
      () => {
        if (!elRef.current || !headings.length) {
          return;
        }

        const scrollTop = Math.max(
          window.pageYOffset,
          document.documentElement.scrollTop,
          document.body.scrollTop
        );

        const hitHeading = headings.find((item, index) => {
          const nextItem = headings[index + 1];
          const { top } = item.getBoundingClientRect();
          const { top: nextTop } = nextItem?.getBoundingClientRect() || {};

          return (
            (index === 0 && scrollTop === 0) ||
            (top <= 20 && (!nextItem || nextTop > 20))
          );
        });

        if (hitHeading) {
          setHit(hitHeading);
        }
      },
      300,
      { trailing: true }
    ),
    [headings]
  );

  // initialize
  useEffect(() => {
    updateHeadings();
  }, [updateHeadings]);

  // mutate
  useMutation(
    mutations => {
      mutations.forEach(
        debounce(
          (m: MutationRecord) => {
            if (m.type === 'childList' || m.type === 'attributes') {
              updateHeadings();
            }
          },
          20,
          { trailing: true }
        )
      );
    },
    {
      target: IN_BROWSER
        ? () => document.querySelector('.markdown-body')
        : null,
      options: {
        subtree: true,
        childList: true,
        attributeFilter: ['data-title'],
      },
      deps: [updateHeadings],
    }
  );

  // hash -> hit
  useEffect(() => {
    const hitHeading = headings.find(item => item.id && item.id === hash);

    if (hitHeading) {
      setHit(hitHeading);
    }
  }, [headings, hash]);

  // scroll -> hit
  useScroll(handleScroll);

  return (
    <div
      className="group sticky top-24 w-56 pl-9 pb-9 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 8rem)' }}
      ref={elRef}
    >
      {headings.map((item, index) => {
        const level = Number(item.tagName.substring(1, 2));
        const isActive = active.includes(item);

        return (
          <Link
            key={index}
            className={`w-full flex items-center py-[6px] text-sm transition-colors hover:text-c-text ${
              isActive ? 'text-c-text' : 'text-c-text-lightest'
            } ${level === 2 ? 'font-semibold' : ''}`}
            to={`#${item.id}`}
            color={false}
          >
            <div className="w-4 mr-2">
              <div
                className={`h-1 rounded-[0.25rem] bg-current ${
                  isActive ? 'opacity-80' : 'opacity-40'
                }`}
                style={{ width: `${(2 / level) * 100}%` }}
              ></div>
            </div>
            <div
              className={`transition-opacity group-hover:opacity-100 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {item.dataset.title}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
