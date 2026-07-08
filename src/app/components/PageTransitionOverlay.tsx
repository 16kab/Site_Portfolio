import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePageTransition } from '../context/PageTransitionContext';

export function PageTransitionOverlay() {
  const { 
    isTransitioning, 
    setIsTransitioning, 
    transitionImageSrc, 
    transitionImageRect,
    isReverse 
  } = usePageTransition();

  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isTransitioning && transitionImageSrc && transitionImageRect) {
      setShowOverlay(true);
      
      // End transition after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setShowOverlay(false);
      }, isReverse ? 1000 : 2000); // Reduced since navigation is delayed

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionImageSrc, transitionImageRect, setIsTransitioning, isReverse]);

  // Only show on desktop/laptop (min-width: 1024px)
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop || !showOverlay || !transitionImageSrc || !transitionImageRect) {
    return null;
  }

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated Image */}
          <motion.img
            src={transitionImageSrc}
            alt=""
            className="absolute object-cover object-center"
            initial={
              isReverse
                ? {
                    left: 0,
                    top: 0,
                    width: '100vw',
                    height: '100vh',
                    borderRadius: '0px',
                    opacity: 1,
                  }
                : {
                    left: transitionImageRect.left,
                    top: transitionImageRect.top,
                    width: transitionImageRect.width,
                    height: transitionImageRect.height,
                    borderRadius: '8px',
                    opacity: 1,
                  }
            }
            animate={
              isReverse
                ? {
                    left: transitionImageRect.left,
                    top: transitionImageRect.top,
                    width: transitionImageRect.width,
                    height: transitionImageRect.height,
                    borderRadius: '8px',
                    opacity: 1,
                  }
                : {
                    left: 0,
                    top: 0,
                    width: '100vw',
                    height: '100vh',
                    borderRadius: '0px',
                    opacity: [1, 1, 0],
                  }
            }
            transition={
              isReverse
                ? {
                    duration: 0.8,
                    ease: [0.76, 0, 0.24, 1],
                    delay: 0.3,
                  }
                : {
                    left: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                    top: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                    width: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                    height: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                    borderRadius: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                    opacity: { duration: 2.0, times: [0, 0.8, 1], ease: 'easeOut' },
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
                ? { duration: 0.5, delay: 0 }
                : { duration: 2.0, times: [0, 0.5, 1], ease: 'easeOut' }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}