import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  phaseKey: string
  children: ReactNode
}

export default function PhaseTransition({ phaseKey, children }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phaseKey}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
