import { useEffect } from 'react';
import nProgress from 'nprogress';
import { useRouter } from 'onepress/client';
import '../styles/nprogress.less';

export function useLoadProgress() {
  const router = useRouter();

  useEffect(() => {
    if (router.pending) {
      nProgress.start();

      return () => {
        nProgress.done();
      };
    }
  }, [router.pending]);
}
