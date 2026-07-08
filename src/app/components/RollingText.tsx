"use client"

import { motion, type Transition, type UseInViewOptions, useInView } from "motion/react"
import * as React from "react"

const ENTRY_ANIMATION = {
  initial: { rotateX: 0 },
  animate: { rotateX: 90 },
}

const EXIT_ANIMATION = {
  initial: { rotateX: 90 },
  animate: { rotateX: 0 },
}

const formatCharacter = (char: string) => (char === " " ? "\u00A0" : char)

type RollingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  transition?: Transition
  inView?: boolean
  inViewMargin?: UseInViewOptions["margin"]
  inViewOnce?: boolean
  text: string
}

function RollingText({
  ref,
  transition = { duration: 0.5, delay: 0.1, ease: "easeOut" },
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  text,
  ...props
}: RollingTextProps) {
  const localRef = React.useRef<HTMLSpanElement>(null)
  React.useImperativeHandle(ref as any, () => localRef.current!)

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  })
  const isInView = !inView || inViewResult

  const characters = React.useMemo(() => text.split(""), [text])

  return (
    <span data-slot="rolling-text" {...(props as any)} ref={ref} style={{ pointerEvents: 'none', position: 'relative' }}>
      {characters.map((char, idx) => (
        <span
          aria-hidden="true"
          className="relative inline-block perspective-[9999999px] transform-3d w-auto"
          key={idx}
          style={{ pointerEvents: 'none' }}
        >
          <motion.span
            animate={isInView ? ENTRY_ANIMATION.animate : ENTRY_ANIMATION.initial}
            className="absolute inline-block backface-hidden origin-[50%_25%]"
            initial={ENTRY_ANIMATION.initial}
            transition={{
              ...transition,
              delay: isInView ? idx * (transition?.delay ?? 0) - 0.2 : idx * (transition?.delay ?? 0),
            }}
            style={{ pointerEvents: 'none' }}
          >
            {formatCharacter(char)}
          </motion.span>
          <motion.span
            animate={isInView ? EXIT_ANIMATION.animate : EXIT_ANIMATION.initial}
            className="absolute inline-block backface-hidden origin-[50%_100%]"
            initial={EXIT_ANIMATION.initial}
            transition={{
              ...transition,
              delay: isInView ? idx * (transition?.delay ?? 0) : idx * (transition?.delay ?? 0) - 0.2,
            }}
            style={{ pointerEvents: 'none' }}
          >
            {formatCharacter(char)}
          </motion.span>
          <span className="invisible" style={{ pointerEvents: 'none' }}>{formatCharacter(char)}</span>
        </span>
      ))}

      <span className="sr-only">{text}</span>
    </span>
  )
}

export { RollingText, type RollingTextProps }
export default RollingText