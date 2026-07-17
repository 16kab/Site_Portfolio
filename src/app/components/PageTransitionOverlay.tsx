import { useEffect } from 'react';
import { motion } from 'motion/react';
import { usePageTransition } from '../context/PageTransitionContext';
import { getProjectTransitionTiming } from '../utils/projectTransition';

export function PageTransitionOverlay() {
  const { isTransitioning, snapshot, direction, completeTransition } = usePageTransition();

  useEffect(() => {
    if (!isTransitioning || snapshot === null || direction === null) {
      return;
    }

    const timing = getProjectTransitionTiming(window.innerWidth, direction);
    const timer = window.setTimeout(completeTransition, timing.overlayDuration);

    return () => window.clearTimeout(timer);
  }, [completeTransition, direction, isTransitioning, snapshot]);

  if (!isTransitioning || snapshot === null || direction === null) {
    return null;
  }

  const timing = getProjectTransitionTiming(window.innerWidth, direction);
  const isReverse = direction === 'reverse';
  const cardRect = { ...snapshot.imageRect, borderRadius: 8 };
  const fullRect = {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    borderRadius: 0,
  };
  const morphTransition = {
    duration: timing.morphDuration,
    ease: [0.76, 0, 0.24, 1] as const,
  };

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Image */}
      <motion.img
        src={snapshot.imageSrc}
        alt=""
        className="absolute object-cover object-center"
        initial={{ ...(isReverse ? fullRect : cardRect), opacity: 1 }}
        animate={{
          ...(isReverse ? cardRect : fullRect),
          opacity: isReverse ? 1 : [1, 1, 0],
        }}
        transition={
          isReverse
            ? { ...morphTransition, delay: timing.reverseDelay }
            : {
                left: morphTransition,
                top: morphTransition,
                width: morphTransition,
                height: morphTransition,
                borderRadius: morphTransition,
                opacity: {
                  duration: timing.overlayDuration / 1000,
                  times: [0, 0.75, 1],
                  ease: 'easeOut',
                },
              }
        }
      />

      {/* Dark overlay for hero text */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        initial={{ opacity: isReverse ? 1 : 0 }}
        animate={{ opacity: isReverse ? 0 : [0, 0.6, 0] }}
        transition={
          isReverse
            ? { duration: Math.min(0.5, timing.morphDuration), delay: 0 }
            : {
                duration: timing.overlayDuration / 1000,
                times: [0, 0.5, 1],
                ease: 'easeOut',
              }
        }
      />
    </motion.div>
  );
}
