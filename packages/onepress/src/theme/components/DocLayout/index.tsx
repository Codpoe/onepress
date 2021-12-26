import React from 'react';
// import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { Page } from 'onepress/client';
// import { useScrollPromise } from '../../hooks/useScrollPromise';
import { Mdx } from '../Mdx';
import { UpdateInfo } from '../UpdateInfo';
import { PrevNext } from '../PrevNext';
import { Toc } from '../Toc';
import { Loading } from '../Loading';
import './style.css';

export const DocLayout: React.FC = () => {
  return (
    <div className="block xl:flex">
      <div className="flex-auto max-w-[800px] mx-auto px-4 pt-8 pb-10">
        <Mdx className="pb-8">
          <Page
            fallback={<Loading className="text-xl" />}
            timeout={3000}
            fallbackMinMs={300}
          />
        </Mdx>
        <UpdateInfo />
        <PrevNext />
      </div>
      {/* disable toc while using hash router */}
      {!__HASH_ROUTER__ && (
        <div className="hidden xl:block shrink-0 w-64 h-[calc(100vh-4rem)] py-8 pr-4 overflow-y-auto sticky top-16">
          <Toc />
        </div>
      )}
      {/* <Page>
        {({ pathname, element, loading }) => {
          if (element && loading) {
            console.log('pending');
            scrollPromise.pending();
          }
          return (
            <SwitchTransition mode="out-in">
              <CSSTransition
                key={pathname}
                classNames="page-slide-anim"
                timeout={240} // scroll pending until enter
                onEnter={scrollPromise.resolve}
                onExit={scrollPromise.pending}
              >
                <div>
                  <Mdx className="pb-8">{element}</Mdx>
                  <UpdateInfo />
                  <PrevNext pathname={pathname} />
                </div>
              </CSSTransition>
            </SwitchTransition>
          );
        }}
      </Page> */}
    </div>
  );
};
