"use client"

import { motion, useInView, useReducedMotion, type UseInViewOptions } from "motion/react"
import { useRef } from "react"

interface ScrollFadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  amount?: UseInViewOptions["amount"]
  margin?: UseInViewOptions["margin"]
  disabled?: boolean
}

const hiddenState = { opacity: 0, y: 50, filter: "blur(10px)" }
const visibleState = { opacity: 1, y: 0, filter: "blur(0px)" }

export default function ScrollFadeIn({ 
  children, 
  className = "",
  delay = 0,
  amount = 0.3,
  margin = "0px",
  disabled = false
}: ScrollFadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount, margin })
  const shouldReduceMotion = useReducedMotion()
  const shouldDisableAnimation = disabled || shouldReduceMotion

  return (
    <motion.div
      ref={ref}
      initial={shouldDisableAnimation ? false : hiddenState}
      animate={shouldDisableAnimation || isInView ? visibleState : hiddenState}
      transition={
        shouldDisableAnimation
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
