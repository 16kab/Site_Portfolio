import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { usePageTransition } from '../context/PageTransitionContext';
import type { ProjectTransitionSnapshot } from '../utils/projectTransition';

type TransitionRoute = Pick<
  ProjectTransitionSnapshot,
  'originPath' | 'projectLink'
>;

export const shouldRestoreProjectScroll = (
  pathname: string,
  snapshot: TransitionRoute | null,
) => snapshot?.originPath === '/projets' && pathname === '/projets';

export const isTransitionRoute = (
  pathname: string,
  snapshot: TransitionRoute | null,
) =>
  Boolean(
    snapshot &&
      (pathname === snapshot.originPath || pathname === snapshot.projectLink),
  );

export function ScrollToTop() {
  const { pathname } = useLocation();
  const { snapshot, clearTransition } = usePageTransition();
  const handledPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (handledPathRef.current === pathname) return;

    handledPathRef.current = pathname;
    if (!shouldRestoreProjectScroll(pathname, snapshot)) {
      document.body.scrollTop = 0;
    }
  }, [pathname, snapshot]);

  useEffect(() => {
    if (snapshot && !isTransitionRoute(pathname, snapshot)) {
      clearTransition();
    }
  }, [pathname, snapshot, clearTransition]);

  return null;
}
