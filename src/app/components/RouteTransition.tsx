import { useEffect, useRef, useState } from 'react';
import { Routes, useLocation, type Location } from 'react-router';
import { PageVeil, type VeilPhase } from './PageVeil';
import { usePageTransition } from '../context/PageTransitionContext';
import { prefersReducedProjectMotion } from '../utils/projectTransition';

// Reset scroll au swap, sauf sur /projets (qui restaure son propre scroll).
function resetScrollFor(pathname: string) {
  if (pathname !== '/projets') document.body.scrollTop = 0;
}

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isTransitioning } = usePageTransition();
  const [displayed, setDisplayed] = useState<Location>(location);
  const [phase, setPhase] = useState<VeilPhase | null>(null);
  // Location vers laquelle on transitionne (pour un swap correct même si la
  // location change encore pendant la couverture).
  const pendingRef = useRef<Location | null>(null);

  useEffect(() => {
    if (location.key === displayed.key) return; // déjà affichée
    pendingRef.current = location;
    if (isTransitioning || prefersReducedProjectMotion()) {
      // Pas de voile : le morph/overlay gère (ou reduced-motion) → swap direct.
      setDisplayed(location);
      resetScrollFor(location.pathname);
      setPhase(null);
      return;
    }
    setPhase('covering'); // on garde `displayed` (ancienne page) jusqu'à couverture
  }, [location, displayed, isTransitioning]);

  return (
    <>
      <Routes location={displayed}>{children}</Routes>
      {phase ? (
        <PageVeil
          phase={phase}
          onCovered={() => {
            const target = pendingRef.current;
            if (target) {
              setDisplayed(target);
              resetScrollFor(target.pathname);
            }
            setPhase('revealing');
          }}
          onRevealed={() => setPhase(null)}
        />
      ) : null}
    </>
  );
}
