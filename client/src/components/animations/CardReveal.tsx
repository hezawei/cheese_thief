import { useState } from 'react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  front: ReactNode
  back?: ReactNode
  autoFlip?: boolean
  delay?: number
}

export default function CardReveal({ front, back, autoFlip = true, delay = 0.3 }: Props) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: '800px' }}
      onClick={() => !autoFlip && setFlipped((f) => !f)}
    >
      <motion.div
        initial={autoFlip ? { rotateY: 180 } : false}
        animate={{ rotateY: autoFlip || flipped ? 0 : 180 }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front face */}
        <div style={{ backfaceVisibility: 'hidden' }}>
          {front}
        </div>

        {/* Back face */}
        {back && (
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {back}
          </div>
        )}
      </motion.div>
    </div>
  )
}
