'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

interface ScrollRevealTitleProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const hiddenState = { opacity: 0, y: 50, filter: 'blur(10px)' };
const visibleState = { opacity: 1, y: 0, filter: 'blur(0px)' };

export default function ScrollRevealTitle({
  children,
  className = '',
  delay = 0,
}: ScrollRevealTitleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className="overflow-visible"
      style={{ position: 'relative' }}
    >
      <motion.div
        initial={shouldReduceMotion ? false : hiddenState}
        animate={shouldReduceMotion || isInView ? visibleState : hiddenState}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: delay,
              }
        }
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

export { ScrollRevealTitle };
