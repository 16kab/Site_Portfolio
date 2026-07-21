'use client';

import {
  motion,
  type Transition,
  type UseInViewOptions,
  useInView,
  useReducedMotion,
} from 'motion/react';
import * as React from 'react';

const ENTRY_ANIMATION = {
  initial: { rotateX: 0 },
  animate: { rotateX: 90 },
};

const EXIT_ANIMATION = {
  initial: { rotateX: 90 },
  animate: { rotateX: 0 },
};

const formatCharacter = (char: string) => (char === ' ' ? '\u00A0' : char);

type RollingTextProps = Omit<
  React.ComponentProps<'span'>,
  'children' | 'ref'
> & {
  ref?: React.Ref<HTMLSpanElement>;
  transition?: Transition;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  text: string;
};

function RollingText({
  ref,
  transition = { duration: 0.5, delay: 0.1, ease: 'easeOut' },
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  text,
  ...props
}: RollingTextProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => localRef.current!);

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;
  const shouldReduceMotion = useReducedMotion();

  const characters = React.useMemo(() => text.split(''), [text]);

  // Mouvement réduit : texte statique, sans rotation par lettre
  if (shouldReduceMotion) {
    return (
      <span data-slot="rolling-text" {...props} ref={ref}>
        {text}
      </span>
    );
  }

  return (
    <span
      data-slot="rolling-text"
      {...props}
      ref={ref}
      style={{ pointerEvents: 'none', position: 'relative' }}
    >
      {characters.map((char, idx) => (
        <span
          aria-hidden="true"
          className="relative inline-block perspective-[9999999px] transform-3d w-auto"
          key={idx}
          style={{ pointerEvents: 'none' }}
        >
          <motion.span
            animate={
              isInView ? ENTRY_ANIMATION.animate : ENTRY_ANIMATION.initial
            }
            className="absolute inline-block backface-hidden origin-[50%_25%]"
            // Pas d'animation au montage : seule la bascule isInView (survol /
            // apparition au scroll) anime. Évite que les lettres nouvellement
            // montées lors d'un changement de texte (ex. bascule FR/EN)
            // rejouent l'animation.
            initial={false}
            transition={{
              ...transition,
              delay: isInView
                ? idx * (transition?.delay ?? 0) - 0.2
                : idx * (transition?.delay ?? 0),
            }}
            style={{ pointerEvents: 'none' }}
          >
            {formatCharacter(char)}
          </motion.span>
          <motion.span
            animate={isInView ? EXIT_ANIMATION.animate : EXIT_ANIMATION.initial}
            className="absolute inline-block backface-hidden origin-[50%_100%]"
            initial={false}
            transition={{
              ...transition,
              delay: isInView
                ? idx * (transition?.delay ?? 0)
                : idx * (transition?.delay ?? 0) - 0.2,
            }}
            style={{ pointerEvents: 'none' }}
          >
            {formatCharacter(char)}
          </motion.span>
          <span className="invisible" style={{ pointerEvents: 'none' }}>
            {formatCharacter(char)}
          </span>
        </span>
      ))}

      <span className="sr-only">{text}</span>
    </span>
  );
}

export { RollingText, type RollingTextProps };
export default RollingText;
