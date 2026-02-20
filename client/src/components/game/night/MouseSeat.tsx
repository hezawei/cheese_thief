import { motion } from 'motion/react'
import SleepyMouse from '@/assets/characters/SleepyMouse'
import SleepyMouseAwake from '@/assets/characters/SleepyMouseAwake'
import type { NightSeat } from '@shared/types'

interface Props {
  seat: NightSeat
  x: number
  y: number
  mouseSize: number
}

/**
 * Positioning strategy (same as DiceCup):
 *   The wrapper div is sized to exactly match the mouse SVG.
 *   translate(-50%, -50%) centers the *mouse image* on (x,y).
 *   The name label is absolutely positioned below the wrapper,
 *   so it doesn't affect centering calculations.
 */
export default function MouseSeat({ seat, x, y, mouseSize }: Props) {
  const imgH = mouseSize * (260 / 240)

  return (
    /* Plain div for positioning — Framer Motion cannot touch this transform */
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: mouseSize,
        height: imgH,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* motion.div ONLY for entrance animation — no positioning here */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: seat.seatIndex * 0.06, duration: 0.3 }}
      >
        <div
          className="relative"
          style={seat.isSelf ? { filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' } : undefined}
        >
          {seat.isAwake ? (
            <SleepyMouseAwake size={mouseSize} />
          ) : (
            <SleepyMouse size={mouseSize} />
          )}
        </div>
      </motion.div>

      {/* Name label — positioned below the mouse */}
      <span
        className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] leading-tight ${
          seat.isSelf
            ? 'text-cheese-300 font-bold'
            : seat.isAwake
              ? 'text-white/80'
              : 'text-white/30'
        }`}
        style={{ top: imgH + 2 }}
      >
        {seat.isSelf ? '(你)' : seat.playerName}
      </span>
    </div>
  )
}
