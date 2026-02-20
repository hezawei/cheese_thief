import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { getSocket } from '@/lib/socket'
import { C2S } from '@shared/events'
import Cheese from '@/assets/characters/Cheese'
import { audioManager } from '@/audio/AudioManager'

interface ThiefProps {
  canSteal: boolean
  hasStolen: boolean
  awakeCount: number
}

export function ThiefStealPanel({ canSteal, hasStolen, awakeCount }: ThiefProps) {
  const [stealing, setStealing] = useState(false)

  function handleSteal() {
    if (!canSteal || stealing) return
    setStealing(true)
    audioManager.playSfx('steal')
    getSocket().emit(C2S.NIGHT_STEAL)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence mode="wait">
        {canSteal && !hasStolen && !stealing && (
          <motion.div
            key="steal-btn"
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <p className="text-white/50 text-xs text-center">
              选择时机偷走奶酪...
            </p>
            <Button
              onClick={handleSteal}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-10 text-base"
            >
              🤫 偷窃!
            </Button>
          </motion.div>
        )}

        {(hasStolen || stealing) && (
          <motion.div
            key="stolen"
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.p
              className="text-red-400 font-bold text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              奶酪到手!
            </motion.p>
            {awakeCount > 1 && (
              <motion.p
                className="text-white/40 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                有人看到了你...
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface WitnessProps {
  stealerName: string | null
}

export function WitnessStealPanel({ stealerName }: WitnessProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      <motion.p
        className="text-yellow-400 font-bold text-sm text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        你看到 {stealerName} 偷走了奶酪!
      </motion.p>
    </motion.div>
  )
}

interface CheeseStealAnimProps {
  playing: boolean
  cheeseSize: number
  thiefX: number
  thiefY: number
}

function ThiefPaw({ size, angleDeg }: { size: number; angleDeg: number }) {
  return (
    <div style={{ transform: `rotate(${angleDeg}deg)`, transformOrigin: 'center' }}>
      <svg viewBox="0 0 80 50" width={size} height={size * 0.625} xmlns="http://www.w3.org/2000/svg">
        {/* Arm */}
        <path d="M0 25 Q20 22 40 20 Q55 18 65 22" stroke="#C4A882" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M0 25 Q20 22 40 20 Q55 18 65 22" stroke="#D4BC9A" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* Palm */}
        <ellipse cx="66" cy="24" rx="10" ry="9" fill="#D4BC9A" />
        <ellipse cx="66" cy="24" rx="10" ry="9" fill="#E2CDB0" opacity="0.5" />
        {/* Fingers reaching */}
        <path d="M72 17 Q76 12 78 16" stroke="#D4BC9A" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M74 20 Q79 16 80 20" stroke="#D4BC9A" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M74 27 Q80 25 80 29" stroke="#D4BC9A" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Tiny claws */}
        <circle cx="78" cy="14" r="1.5" fill="#B89E78" />
        <circle cx="80" cy="19" r="1.5" fill="#B89E78" />
        <circle cx="80" cy="28" r="1.5" fill="#B89E78" />
      </svg>
    </div>
  )
}

/**
 * Directional steal animation.
 * thiefX/thiefY are the thief seat position relative to the cheese center (0,0).
 * The paw enters FROM the thief's direction, grabs the cheese, and drags it back.
 */
export function CheeseStealAnim({ playing, cheeseSize, thiefX, thiefY }: CheeseStealAnimProps) {
  const pawSize = cheeseSize * 0.85

  // Direction from center to thief (unit vector)
  const dist = Math.sqrt(thiefX * thiefX + thiefY * thiefY) || 1
  const dirX = thiefX / dist
  const dirY = thiefY / dist

  // Angle of the paw (SVG paw points right by default, so 0° = right)
  const angleDeg = Math.atan2(thiefY, thiefX) * (180 / Math.PI)

  // Keyframe positions along the thief→center→thief path
  const farX = dirX * dist * 0.8   // starting point (near thief)
  const nearX = dirX * 15           // close to cheese
  const nearY = dirY * 15
  const farY = dirY * dist * 0.8
  const retreatX = dirX * dist * 0.6
  const retreatY = dirY * dist * 0.6

  return (
    <AnimatePresence>
      {playing && (
        <div key="steal-scene" className="pointer-events-none" style={{ position: 'relative' }}>
          {/* Cheese — sits still, then gets dragged toward the thief */}
          <motion.div
            style={{ position: 'absolute', left: 0, top: 0, x: '-50%', y: '-50%' }}
            animate={{
              x: ['-50%', '-50%', '-50%', '-50%'],
              y: ['-50%', '-50%', '-50%', '-50%'],
              left: [0, 0, 0, retreatX],
              top: [0, 0, 0, retreatY],
              rotate: [0, 0, -3, -15 * dirX],
              opacity: [1, 1, 1, 0],
              scale: [1, 1, 1.05, 0.6],
            }}
            transition={{
              duration: 3,
              times: [0, 0.4, 0.55, 1],
              ease: 'easeInOut',
            }}
          >
            <Cheese size={cheeseSize} />
          </motion.div>

          {/* Thief paw — sneaks in from thief direction, pauses, grabs, retreats */}
          <motion.div
            style={{ position: 'absolute', x: '-50%', y: '-50%' }}
            initial={{ left: farX, top: farY, opacity: 0 }}
            animate={{
              left: [farX, nearX, 0, retreatX],
              top: [farY, nearY, 0, retreatY],
              opacity: [0, 0.9, 1, 0],
            }}
            transition={{
              duration: 3,
              times: [0, 0.35, 0.55, 1],
              ease: 'easeInOut',
            }}
          >
            <ThiefPaw size={pawSize} angleDeg={angleDeg} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
