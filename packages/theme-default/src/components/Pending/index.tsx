import React from 'react';
import { useEffect } from 'react';
import nProgress from 'nprogress';
import '../../styles/nprogress.less';

export const Pending: React.FC = () => {
  useEffect(() => {
    nProgress.start();

    return () => {
      nProgress.done();
    };
  }, []);

  return null;
};
