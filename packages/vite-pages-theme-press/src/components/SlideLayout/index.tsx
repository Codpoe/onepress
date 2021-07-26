import React, { useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useTheme } from '../../context';
import { useElementSize } from '../../hooks/useElementSize';
import { useKeyDown } from '../../hooks/useKeyDown';
import { Mdx } from '../Mdx';

const RATIO = 16 / 9;
const SLIDE_WIDTH = 1024;
const SLIDE_HEIGHT = Math.round(SLIDE_WIDTH / RATIO);

function useScale() {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(() => ref.current);

  const scale = (() => {
    if (width / height < RATIO) {
      return width / SLIDE_WIDTH;
    }
    return (height * RATIO) / SLIDE_WIDTH;
  })();

  return {
    ref: ref,
    scale,
  };
}

function useGenerateSlidePath() {
  const { loadedRoutePath } = useTheme();
  return (page: number) => `${loadedRoutePath?.replace(/\/\d+$/, '')}/${page}`;
}

function usePage() {
  const { loadedRoutePath } = useTheme();
  return useMemo(() => {
    const [, page = 1] = loadedRoutePath?.match(/\/(\d+)$/) || [];
    return Number(page);
  }, [loadedRoutePath]);
}

export const SlideLayout: React.FC = () => {
  const { push } = useHistory();
  const page = usePage();
  const pageRef = useRef(page);
  pageRef.current = page;

  const { staticData, loadedData, loadedRoutePath } = useTheme();
  const { slideCount } = staticData[loadedRoutePath!].main;
  const slideModule = loadedData[loadedRoutePath!].main;

  const SlideComponent: React.ComponentType<any> | undefined =
    slideModule[`Slide_${page}`];

  const generateSlidePath = useGenerateSlidePath();

  const { ref: elRef, scale } = useScale();

  useKeyDown(ev => {
    if ((ev.key === 'ArrowUp' || ev.keyCode === 38) && pageRef.current > 1) {
      push(generateSlidePath(pageRef.current - 1));
    }

    if (
      (ev.key === 'ArrowDown' || ev.keyCode === 40) &&
      pageRef.current <= slideCount
    ) {
      push(generateSlidePath(pageRef.current + 1));
    }
  });

  return (
    <div
      ref={elRef}
      className="w-screen h-screen flex flex-col justify-center items-center bg-black"
    >
      <div
        className={`overflow-hidden ${SlideComponent ? 'bg-c-bg' : ''}`}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {SlideComponent ? (
          <Mdx className="mx-14 my-9">
            <SlideComponent />
          </Mdx>
        ) : (
          <div className="w-full h-full flex justify-center items-center text-xl text-light-700 tracking-widest">
            END
          </div>
        )}
      </div>
    </div>
  );
};
