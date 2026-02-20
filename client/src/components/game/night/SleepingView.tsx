import { motion } from 'motion/react'
import StarField from '@/assets/backgrounds/StarField'
import SleepyMouse from '@/assets/characters/SleepyMouse'
import { DICE_MAX } from '@shared/constants'

interface Props {
  currentDice: number
}

export default function SleepingView({ currentDice }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <StarField />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <SleepyMouse size={140} />
        </motion.div>

        <motion.p
          className="text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          你正在沉睡...
        </motion.p>

        <motion.p
          className="text-white/20 text-lg"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          zzZ
        </motion.p>

        {/* Dice progress */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: DICE_MAX }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                d === currentDice
                  ? 'bg-white/20 text-white/60'
                  : d < currentDice
                    ? 'bg-white/10 text-white/30'
                    : 'border border-white/10 text-white/15'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
