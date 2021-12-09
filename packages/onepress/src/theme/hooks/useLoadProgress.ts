import { useEffect } from 'react';
import { usePageState } from 'onepress/client';
import nProgress from 'nprogress';
import '../styles/nprogress.css';

/**
 * show nprogress while page loading
 */
export function useLoadProgress() {
  const { loading } = usePageState();

  useEffect(() => {
    if (loading) {
      // delay displaying progress bar to avoid flashing
      const timer = setTimeout(() => nProgress.start(), 200);
      return () => {
        clearTimeout(timer);
        nProgress.done();
      };
    }
  }, [loading]);
}
