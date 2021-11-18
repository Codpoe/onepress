import { useEffect } from 'react';
import nProgress from 'nprogress';
import '../styles/nprogress.less';
import { useThemeContext } from '../context';

// TODO: load progress
export function useLoadProgress() {
  const { pagePath } = useThemeContext();

  useEffect(() => {
    nProgress.done();

    return () => {
      nProgress.start();
    };
  }, [pagePath]);
}
