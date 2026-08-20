import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { usePageTransition } from '../context/PageTransitionContext';
import type { ProjectTransitionSnapshot } from '../utils/projectTransition';

type TransitionRoute = Pick<
  ProjectTransitionSnapshot,
  'originPath' | 'projectLink'
>;

// La page Projets gère elle-même sa position de défilement (mémoire dédiée),
// donc ScrollToTop ne la remet jamais en haut.
export const shouldRestoreProjectScroll = (pathname: string) =>
  pathname === '/projets';

export const isTransitionRoute = (
  pathname: string,
  snapshot: TransitionRoute | null,
) =>
  Boolean(
    snapshot &&
      (pathname === snapshot.originPath || pathname === snapshot.projectLink),
  );

// Le reset du scroll est désormais géré par RouteTransition (au swap). Ce
// composant ne conserve que le nettoyage d'un snapshot de morph devenu obsolète.
export function ScrollToTop() {
  const { pathname } = useLocation();
  const { snapshot, clearTransition } = usePageTransition();

  useEffect(() => {
    if (snapshot && !isTransitionRoute(pathname, snapshot)) {
      clearTransition();
    }
  }, [pathname, snapshot, clearTransition]);

  return null;
}
