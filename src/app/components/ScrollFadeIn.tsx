"use client"

import { motion, useInView, useReducedMotion, type UseInViewOptions } from "motion/react"
import { useRef } from "react"

interface ScrollFadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  amount?: UseInViewOptions["amount"]
  margin?: UseInViewOptions["margin"]
}

const hiddenState = { opacity: 0, y: 50, filter: "blur(10px)" }
const visibleState = { opacity: 1, y: 0, filter: "blur(0px)" }

export default function ScrollFadeIn({ 
  children, 
  className = "",
  delay = 0,
  amount = 0.3,
  margin = "0px"
}: ScrollFadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount, margin })
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : hiddenState}
      animate={shouldReduceMotion || isInView ? visibleState : hiddenState}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay
            }
      }
      className={className}
      style={{ pointerEvents: 'auto', position: 'relative' }}
    >
      {children}
    </motion.div>
  )
}

export { ScrollFadeIn };
