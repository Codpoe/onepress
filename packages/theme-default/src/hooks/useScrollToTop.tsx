import { useEffect, useRef } from 'react';
import { useLocation } from 'onepress/client';
import { useScrollPromise } from './useScrollPromise';

export function useScrollToTop(pagePath: string) {
  const { action } = useLocation().history;
  const actionRef = useRef(action);
  const scrollPromise = useScrollPromise();

  actionRef.current = action;

  useEffect(() => {
    if (actionRef.current === 'PUSH' && !window.location.hash) {
      (async () => {
        await scrollPromise.wait();
        window.scrollTo({
          top: 0,
        });
      })();
    }
  }, [pagePath, scrollPromise]);
}
