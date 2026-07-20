import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { usePageTransition } from '../context/PageTransitionContext';
import {
  getProjectTransitionTiming,
  type ProjectTransitionSnapshot,
} from '../utils/projectTransition';

const MORPH_EASE = [0.76, 0, 0.24, 1] as const;

type Timing = ReturnType<typeof getProjectTransitionTiming>;

const getFullRect = () => ({
  left: 0,
  top: 0,
  width: window.innerWidth,
  height: window.innerHeight,
  borderRadius: 0,
});

interface OverlayProps {
  snapshot: ProjectTransitionSnapshot;
  timing: Timing;
  completeTransition: () => void;
}

/**
 * Aller (liste → détail) : l'image de la carte grossit jusqu'au plein écran,
 * puis l'overlay ne se dissipe que lorsque le morph est terminé ET que la
 * page d'arrivée s'est montée (`hasArrived`) — les pages étant lazy-loadées,
 * une dissipation sur simple minuterie révélerait l'ancienne page.
 */
function ForwardOverlay({
  snapshot,
  timing,
  hasArrived,
  completeTransition,
}: OverlayProps & { hasArrived: boolean }) {
  const [morphDone, setMorphDone] = useState(false);
  const revealing = morphDone && hasArrived;

  // Fin du morph pilotée par minuterie (même durée que l'animation Motion)
  useEffect(() => {
    const timer = window.setTimeout(
      () => setMorphDone(true),
      timing.morphDuration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [timing.morphDuration]);

  // Révélation : fondu puis fin de transition
  useEffect(() => {
    if (!revealing) return;
    const timer = window.setTimeout(
      completeTransition,
      timing.fadeDuration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [revealing, timing.fadeDuration, completeTransition]);

  // Filet de sécurité si la page d'arrivée ne se signale jamais
  useEffect(() => {
    const timer = window.setTimeout(completeTransition, timing.overlayDuration);
    return () => window.clearTimeout(timer);
  }, [timing.overlayDuration, completeTransition]);

  const cardRect = { ...snapshot.imageRect, borderRadius: 8 };

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: revealing ? 0 : 1 }}
      transition={{ duration: timing.fadeDuration, ease: 'easeOut' }}
    >
      <motion.img
        src={snapshot.imageSrc}
        alt=""
        className="absolute object-cover object-center"
        initial={{ ...cardRect }}
        animate={{ ...getFullRect() }}
        transition={{ duration: timing.morphDuration, ease: MORPH_EASE }}
      />

      {/* Monte vers le dégradé du hero (opacité 1) pour un fondu invisible */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: timing.morphDuration, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/** Retour (détail → liste) : le plein écran se replie sur la carte. */
function ReverseOverlay({
  snapshot,
  timing,
  completeTransition,
}: OverlayProps) {
  useEffect(() => {
    const timer = window.setTimeout(completeTransition, timing.overlayDuration);
    return () => window.clearTimeout(timer);
  }, [timing.overlayDuration, completeTransition]);

  const cardRect = { ...snapshot.imageRect, borderRadius: 8 };

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 1 }}
    >
      <motion.img
        src={snapshot.imageSrc}
        alt=""
        className="absolute object-cover object-center"
        initial={{ ...getFullRect(), opacity: 1 }}
        animate={{ ...cardRect, opacity: 1 }}
        transition={{
          duration: timing.morphDuration,
          ease: MORPH_EASE,
          delay: timing.reverseDelay,
        }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: Math.min(0.5, timing.morphDuration), delay: 0 }}
      />
    </motion.div>
  );
}

export function PageTransitionOverlay() {
  const {
    isTransitioning,
    snapshot,
    direction,
    hasArrived,
    completeTransition,
  } = usePageTransition();

  if (!isTransitioning || snapshot === null || direction === null) {
    return null;
  }

  const timing = getProjectTransitionTiming(window.innerWidth, direction);

  return direction === 'reverse' ? (
    <ReverseOverlay
      snapshot={snapshot}
      timing={timing}
      completeTransition={completeTransition}
    />
  ) : (
    <ForwardOverlay
      snapshot={snapshot}
      timing={timing}
      hasArrived={hasArrived}
      completeTransition={completeTransition}
    />
  );
}
