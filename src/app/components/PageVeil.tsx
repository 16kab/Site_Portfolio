import { motion } from 'motion/react';

export type VeilPhase = 'covering' | 'revealing';

export interface PageVeilProps {
  phase: VeilPhase;
  onCovered: () => void;
  onRevealed: () => void;
}

const DURATION = 0.45;
const EASE = [0.16, 1, 0.3, 1] as const;
// translateY (vh) : caché sous le viewport → cœur opaque centré → sorti par le haut.
const Y_BELOW = '110vh';
const Y_COVER = '-50vh';
const Y_ABOVE = '-210vh';

export function PageVeil({ phase, onCovered, onRevealed }: PageVeilProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[300]"
      style={{
        height: '200vh',
        // Bande sombre à bords haut/bas fondus (opacité 0) pour un balayage doux.
        background:
          'linear-gradient(to bottom, transparent 0%, #0a0a0a 20%, #0a0a0a 80%, transparent 100%)',
      }}
      initial={{ y: Y_BELOW }}
      animate={{ y: phase === 'covering' ? Y_COVER : Y_ABOVE }}
      transition={{ duration: DURATION, ease: EASE }}
      onAnimationComplete={() => {
        if (phase === 'covering') onCovered();
        else onRevealed();
      }}
    />
  );
}
