import React from 'react';
import { Outlet } from 'onepress/client';
import { Mdx } from '../Mdx';
import { UpdateInfo } from '../UpdateInfo';
import { PrevNext } from '../PrevNext';
import { Toc } from '../Toc';
import './style.less';

export const DocLayout: React.FC = () => {
  return (
    <div className="max-w-screen-md mx-auto relative">
      <Mdx className="pb-8">
        <Outlet />
      </Mdx>
      <UpdateInfo />
      <PrevNext />
      {/* disable toc while using hash router */}
      {!__HASH_ROUTER__ && (
        <div className="absolute top-24 bottom-0 left-full hidden 2xl:block">
          <Toc />
        </div>
      )}
    </div>
  );
};
