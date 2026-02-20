import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { getSocket } from '@/lib/socket'
import { C2S } from '@shared/events'
import DiceFace from '@/assets/characters/DiceFace'
import DiceCup from '@/assets/characters/DiceCup'
import type { ViewedDiceInfo, NightSeat } from '@shared/types'

interface ViewDicePanelProps {
  canViewDice: boolean
  viewedDice: ViewedDiceInfo | null
  seats: NightSeat[]
  acted: boolean
  onActed: () => void
}

export function ViewDicePanel({
  canViewDice,
  viewedDice,
  seats,
  acted,
  onActed,
}: ViewDicePanelProps) {
  const otherSeats = seats.filter((s) => !s.isSelf)

  function handleViewDice(targetId: string) {
    if (acted) return
    onActed()
    getSocket().emit(C2S.NIGHT_ACTION, { action: 'VIEW_DICE', targetId })
  }

  function handleSkip() {
    if (acted) return
    onActed()
    getSocket().emit(C2S.NIGHT_ACTION, { action: 'SKIP' })
  }

  if (viewedDice) {
    return (
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-white/70 text-sm">
          <span className="font-bold text-cheese-200">{viewedDice.targetName}</span> 的骰子是
        </p>
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', delay: 2.2 }}
        >
          <DiceFace value={viewedDice.value} size={56} />
        </motion.div>
      </motion.div>
    )
  }

  if (!canViewDice) return null

  return (
    <motion.div
      className="flex flex-col items-center gap-2 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-cheese-200 text-sm text-center font-medium">
        你独自醒来了! 选择偷看一个人的骰盅
      </p>

      <div className="flex flex-col gap-1.5 w-full">
        {otherSeats.map((s, i) => (
          <motion.div
            key={s.playerId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleViewDice(s.playerId)}
              disabled={acted}
              className="w-full"
            >
              {s.playerName}
            </Button>
          </motion.div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSkip}
        disabled={acted}
        className="text-white/30"
      >
        跳过
      </Button>
    </motion.div>
  )
}

interface DiceCupOpenAnimProps {
  targetSeatIndex: number
  playing: boolean
  cupSize: number
}

export function DiceCupOpenAnim({ playing, cupSize }: DiceCupOpenAnimProps) {
  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key="cup-open"
          className="pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Cup tilts open over 2 seconds */}
          <motion.div
            initial={{ rotate: 0, y: 0 }}
            animate={{
              rotate: [0, 0, -25, -25, -25],
              y: [0, 0, -8, -8, 0],
              x: [0, 0, 6, 6, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.3, 0.5, 0.8, 1],
              ease: 'easeInOut',
            }}
          >
            <DiceCup size={cupSize} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
