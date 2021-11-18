import { useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';
import { useScrollPromise } from './useScrollPromise';

export function useScrollToTop(pagePath: string) {
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
  }, [pagePath, scrollPromise]);
}
