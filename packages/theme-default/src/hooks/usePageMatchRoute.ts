import { useCallback } from 'react';
import { useMatchRoute, MatchLocation } from 'onepress/client';
import { usePagePath } from './usePagePath';

export function usePageMatchRoute() {
  const pagePath = usePagePath();
  const matchRoute = useMatchRoute();

  return useCallback(
    (matchLocation: MatchLocation) => {
      return matchRoute(matchLocation);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagePath, matchRoute]
  );
}
