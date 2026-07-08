"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"

interface ScrollFadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ScrollFadeIn({ 
  children, 
  className = "",
  delay = 0
}: ScrollFadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 50, filter: "blur(10px)" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: delay
      }}
      className={className}
      style={{ pointerEvents: 'auto', position: 'relative' }}
    >
      {children}
    </motion.div>
  )
}

export { ScrollFadeIn };