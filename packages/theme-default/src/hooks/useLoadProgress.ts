import { useEffect } from 'react';
import nProgress from 'nprogress';
import { useRouter } from 'onepress/client';
import '../styles/nprogress.less';

export function useLoadProgress() {
  const router = useRouter();

  useEffect(() => {
    if (router.pending) {
      // const timer = setTimeout(() => {
      nProgress.start();
      // }, 50);

      return () => {
        // clearTimeout(timer);
        nProgress.done();
      };
    }
  }, [router.pending]);
}
