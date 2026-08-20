import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { type Location, Routes, useLocation } from 'react-router';
import { usePageTransition } from '../context/PageTransitionContext';
import { prefersReducedProjectMotion } from '../utils/projectTransition';
import { PageVeil, type VeilPhase } from './PageVeil';

// Reset scroll au swap, sauf sur /projets (qui restaure son propre scroll).
function resetScrollFor(pathname: string) {
  if (pathname !== '/projets') document.body.scrollTop = 0;
}

// Sentinelle montée DANS la frontière Suspense, en frère de `<Routes>`. Son
// effet ne se déclenche que lorsque le sous-arbre — page lazy incluse — est
// réellement monté/peint : tant qu'une page lazy suspend, ce composant est lui
// aussi remplacé par le fallback, donc l'effet ne part pas. C'est ce qui permet
// de retenir le voile jusqu'à ce que la nouvelle page soit prête (anti-flash).
function ReadySignal({
  locationKey,
  onReady,
}: {
  locationKey: string;
  onReady: (key: string) => void;
}) {
  useEffect(() => {
    onReady(locationKey);
  }, [locationKey, onReady]);
  return null;
}

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isTransitioning, snapshot } = usePageTransition();
  const [displayed, setDisplayed] = useState<Location>(location);
  const [phase, setPhase] = useState<VeilPhase | null>(null);
  // Location vers laquelle on transitionne (pour un swap correct même si la
  // location change encore pendant la couverture).
  const pendingRef = useRef<Location | null>(null);
  // Clé de la page dont on attend le montage réel avant de révéler (anti-flash
  // des pages lazy) ; null quand on n'attend rien.
  const awaitingReadyRef = useRef<string | null>(null);

  useEffect(() => {
    if (location.key === displayed.key) return; // déjà affichée
    pendingRef.current = location;
    // Reverse morph imminent : la navigation vers `/projets` arrive AVANT
    // que `beginReverse()` ne soit déclenché (Projets ne l'appelle qu'après
    // son propre montage). On détecte ce cas via le snapshot déjà présent
    // (posé par `captureSnapshot`/`beginForward` à l'aller) ciblant cette
    // destination, comme `Projets.tsx` le fait pour son `isReturnVisit`.
    const isReverseMorphTarget = snapshot?.originPath === location.pathname;
    if (
      isTransitioning ||
      isReverseMorphTarget ||
      prefersReducedProjectMotion()
    ) {
      // Pas de voile : le morph/overlay gère (ou reduced-motion) → swap direct.
      setDisplayed(location);
      resetScrollFor(location.pathname);
      setPhase(null);
      return;
    }
    setPhase('covering'); // on garde `displayed` (ancienne page) jusqu'à couverture
  }, [location, displayed, isTransitioning, snapshot]);

  // Appelé quand la page affichée est réellement montée. Ne révèle que si c'est
  // bien la page qu'on attendait (celle swappée à la fin de la couverture).
  const handleReady = useCallback((key: string) => {
    if (awaitingReadyRef.current === key) {
      awaitingReadyRef.current = null;
      setPhase('revealing');
    }
  }, []);

  return (
    <>
      {/* Suspense INTERNE : n'englobe que les routes, pas le voile. Ainsi une
          page lazy qui suspend n'efface que la zone contenu (invisible sous le
          voile opaque), jamais le voile lui-même. */}
      <Suspense fallback={null}>
        <Routes location={displayed}>{children}</Routes>
        <ReadySignal locationKey={displayed.key} onReady={handleReady} />
      </Suspense>
      {phase ? (
        <PageVeil
          phase={phase}
          onCovered={() => {
            const target = pendingRef.current;
            if (target) {
              // Swap sous le voile opaque, puis on ATTEND le montage réel de la
              // nouvelle page (handleReady) avant de révéler → aucun flash même
              // si le chunk lazy n'est pas encore chargé.
              awaitingReadyRef.current = target.key;
              setDisplayed(target);
              resetScrollFor(target.pathname);
            } else {
              setPhase('revealing');
            }
          }}
          onRevealed={() => setPhase(null)}
        />
      ) : null}
    </>
  );
}
