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
      nProgress.start();
      return () => {
        nProgress.done();
      };
    }
  }, [loading]);
}
