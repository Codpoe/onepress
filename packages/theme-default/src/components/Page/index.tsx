import React from 'react';
import { Page as OnepressPage, PageProps } from 'onepress/client';
import nProgress from 'nprogress';
import { Loading } from '../Loading';

import '../../styles/nprogress.less';

export const Page: React.FC<PageProps> = ({ onStatusChange, ...restProps }) => {
  return (
    <OnepressPage
      {...restProps}
      timeout={1000}
      fallback={<Loading className="text-xl" />}
      onStatusChange={status => {
        onStatusChange?.(status);

        if (status === 'pending' || status === 'fallback') {
          nProgress.start();
        } else {
          nProgress.done();
        }
      }}
    />
  );
};
