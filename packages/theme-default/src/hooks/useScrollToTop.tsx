import { useEffect, useRef } from 'react';
import { useNavigationType, usePageState } from 'onepress/client';
import { useScrollPromise } from './useScrollPromise';

/**
 * scroll to top while page change
 */
export function useScrollToTop() {
  const { loadedPathname } = usePageState();
  const navigationType = useNavigationType();
  const navigationTypeRef = useRef(navigationType);
  const scrollPromise = useScrollPromise();

  navigationTypeRef.current = navigationType;

  useEffect(() => {
    if (navigationTypeRef.current === 'PUSH' && !window.location.hash) {
      (async () => {
        await scrollPromise.wait();
        window.scrollTo({
          top: 0,
        });
      })();
    }
  }, [loadedPathname, scrollPromise]);
}
