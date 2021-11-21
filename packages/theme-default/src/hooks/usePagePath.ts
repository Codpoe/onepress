import { useRouter } from 'onepress/client';

export function usePagePath() {
  const router = useRouter();
  return router.state.location.pathname;
}
