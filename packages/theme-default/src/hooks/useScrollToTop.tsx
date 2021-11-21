import { useEffect, useRef } from 'react';
import { useLocation } from 'onepress/client';
import { useScrollPromise } from './useScrollPromise';

export function useScrollToTop(pagePath: string) {
  const { nextAction } = useLocation();
  const nextActionRef = useRef(nextAction);
  const scrollPromise = useScrollPromise();

  nextActionRef.current = nextAction;

  useEffect(() => {
    if (nextActionRef.current === 'push' && !window.location.hash) {
      (async () => {
        await scrollPromise.wait();
        window.scrollTo({
          top: 0,
        });
      })();
    }
  }, [pagePath, scrollPromise]);
}
