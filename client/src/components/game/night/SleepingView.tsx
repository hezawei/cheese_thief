import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import StarField from '@/assets/backgrounds/StarField'
import SleepyMouse from '@/assets/characters/SleepyMouse'
import { DICE_MAX } from '@shared/constants'

interface Props {
  currentDice: number
  remainingSeconds: number
}

export default function SleepingView({ currentDice, remainingSeconds }: Props) {
  const [localSeconds, setLocalSeconds] = useState(remainingSeconds)

  useEffect(() => {
    setLocalSeconds(remainingSeconds)
  }, [remainingSeconds])

  useEffect(() => {
    if (localSeconds <= 0) return
    const tid = setInterval(() => setLocalSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(tid)
  }, [localSeconds > 0])

  const minutes = Math.floor(localSeconds / 60)
  const seconds = localSeconds % 60
  const timeStr = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <StarField />

      <div className="relative z-10 flex flex-col items-center gap-5">
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
          className="text-white/30 text-xs text-center"
          key={currentDice}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          正在等待 {currentDice} 号对应的玩家操作中...
        </motion.p>

        {/* Countdown */}
        {localSeconds > 0 && (
          <p className={`text-xs font-mono ${localSeconds < 10 ? 'text-red-400/60' : 'text-white/25'}`}>
            {timeStr}
          </p>
        )}

        {/* Dice progress */}
        <div className="flex gap-2">
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
