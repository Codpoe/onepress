import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useContext,
  createContext,
  Suspense as ReactSuspense,
} from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import routes from '/@onepress/routes';
import { useAppContext } from './context';
import { Route as IRoute, PageStatus } from './types';

const ActivePageContext = createContext<{
  setActivePage: (component?: React.ReactNode) => void;
}>({ setActivePage: () => null });

export interface PageProps {
  /**
   * The fallback content to show when a Suspense child (like React.lazy) suspends
   */
  fallback?: NonNullable<React.ReactNode> | null;
  /**
   * Tells the <Suspense> component how long to wait before showing the fallback.
   *
   * By default, it won't update the DOM to show the fallback content.
   * Instead, it will continue to show the old DOM until the new components are ready.
   */
  timeout?: number;
  /**
   * The callback for status change
   */
  onStatusChange?: (status: PageStatus) => void;
}

const Fallback: React.FC<PageProps> = ({
  fallback,
  timeout,
  onStatusChange,
  children,
}) => {
  // if timeout === 0 or no children, show real fallback immediately
  const [showRealFallback, setShowRealFallback] = useState(
    timeout === 0 || !children
  );

  useEffect(() => {
    onStatusChange?.(showRealFallback ? 'fallback' : 'pending');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRealFallback]);

  useEffect(() => {
    if (timeout && !showRealFallback) {
      const timer = setTimeout(() => {
        setShowRealFallback(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{showRealFallback ? fallback : children}</>;
};

/**
 * A simple wrapper of React.Suspense
 */
const Suspense: React.FC<PageProps> = ({
  fallback,
  timeout,
  onStatusChange,
  children,
}) => {
  const [activePage, _setActivePage] = useState<React.ReactNode>();

  const setActivePage = useCallback((component?: React.ReactNode) => {
    _setActivePage(component);
    onStatusChange?.('resolve');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ActivePageContext.Provider value={{ setActivePage }}>
      <ReactSuspense
        fallback={
          <Fallback
            fallback={fallback}
            timeout={timeout}
            onStatusChange={onStatusChange}
          >
            {activePage}
          </Fallback>
        }
      >
        {children}
      </ReactSuspense>
    </ActivePageContext.Provider>
  );
};

const PageRenderer: React.FC<{
  component: React.LazyExoticComponent<any>;
  isLayout: boolean;
}> = ({ component, isLayout }) => {
  const Component = component;
  const { setActivePage } = useContext(ActivePageContext);

  const rendered = useMemo(
    () => <Component>{isLayout ? <Outlet /> : undefined}</Component>,
    [Component, isLayout]
  );

  useLayoutEffect(() => {
    (async () => {
      await (component as any)._payload?._result;
      setActivePage(rendered);
    })();
  }, [component, rendered, setActivePage]);

  return rendered;
};

function renderRoutes(routes: IRoute[]) {
  return routes.map(item => {
    const isLayout = Boolean(item.children?.length);

    return (
      <Route
        key={item.path}
        path={item.path}
        element={
          <PageRenderer component={item.component} isLayout></PageRenderer>
        }
      >
        {isLayout ? renderRoutes(item.children!) : undefined}
      </Route>
    );
  });
}

/**
 * Render page content
 */
export const Page: React.FC<PageProps> = props => {
  const { NotFound, onStatusChange } = useAppContext();

  return (
    <Suspense
      {...props}
      onStatusChange={status => {
        onStatusChange(status);
        props.onStatusChange?.(status);
      }}
    >
      <Routes>
        {renderRoutes(routes)}
        {NotFound && <Route path="*" element={<NotFound />} />}
      </Routes>
    </Suspense>
  );
};
