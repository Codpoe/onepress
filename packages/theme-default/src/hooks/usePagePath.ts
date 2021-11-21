import { useRouter, useMatches } from 'onepress/client';

export function usePagePath() {
  const router = useRouter();
  const matches = useMatches();

  return router.state.location.pathname;
}
