import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/hooks/useGameStore'
import { getSocket } from '@/lib/socket'
import { C2S } from '@shared/events'
import { Role } from '@shared/types'
import SleepyMouse from '@/assets/characters/SleepyMouse'
import ThiefMouse from '@/assets/characters/ThiefMouse'
import ScapegoatMouse from '@/assets/characters/ScapegoatMouse'
import DiceFace from '@/assets/characters/DiceFace'

const ROLE_LABELS: Record<string, string> = {
  [Role.THIEF]: '奶酪大盗',
  [Role.SLEEPY]: '贪睡鼠',
  [Role.SCAPEGOAT]: '背锅鼠',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  [Role.THIEF]: '你要在夜晚偷走奶酪，白天隐藏身份，不被投出就赢！',
  [Role.SLEEPY]: '找出谁是奶酪大盗，投票把他投出去！',
  [Role.SCAPEGOAT]: '你是无辜的，但如果被投出，你独自获胜！',
}

const ROLE_COLORS: Record<string, string> = {
  [Role.THIEF]: 'text-red-400',
  [Role.SLEEPY]: 'text-green-400',
  [Role.SCAPEGOAT]: 'text-purple-400',
}

const ROLE_GLOWS: Record<string, string> = {
  [Role.THIEF]: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
  [Role.SLEEPY]: 'shadow-[0_0_40px_rgba(34,197,94,0.3)]',
  [Role.SCAPEGOAT]: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]',
}

function RoleAvatar({ role }: { role: string }) {
  switch (role) {
    case Role.THIEF: return <ThiefMouse size={100} />
    case Role.SLEEPY: return <SleepyMouse size={100} />
    case Role.SCAPEGOAT: return <ScapegoatMouse size={100} />
    default: return null
  }
}

export default function DealingView() {
  const players = useGameStore((s) => s.players)
  const myPlayerId = useGameStore((s) => s.myPlayerId)
  const [ready, setReady] = useState(false)
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)

  const me = players.find((p) => p.id === myPlayerId)
  const role = me?.role ?? null
  const diceValues = me?.diceValues ?? []
  const hasTwoDice = diceValues.length === 2
  const needChoose = hasTwoDice && role !== Role.THIEF

  function handleReady() {
    if (needChoose && chosenIndex === null) return
    setReady(true)
    const chosenValue = chosenIndex !== null ? diceValues[chosenIndex] : null
    getSocket().emit(C2S.DEALING_READY, { chosenWakeDice: chosenValue })
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="flex flex-col items-center justify-center min-h-full gap-5 px-6 py-8">
      <motion.h2
        className="text-xl font-bold text-cheese-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        你的身份
      </motion.h2>

      <motion.div
        className="w-full max-w-[300px]"
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        style={{ perspective: '800px' }}
      >
        <Card className={`${role ? ROLE_GLOWS[role] ?? '' : ''}`}>
          <CardContent className="flex flex-col items-center gap-3 pt-5 pb-4">
            {role && (
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <RoleAvatar role={role} />
                <p className={`text-2xl font-bold ${ROLE_COLORS[role] ?? 'text-foreground'}`}>
                  {ROLE_LABELS[role] ?? role}
                </p>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {ROLE_DESCRIPTIONS[role] ?? ''}
                </p>
              </motion.div>
            )}

            <motion.div
              className="flex flex-col items-center gap-2 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <p className="text-xs text-muted-foreground">
                {role === Role.THIEF && hasTwoDice
                  ? '你的骰子（两个点数都会醒来）'
                  : '你的骰子'}
              </p>
              <div className="flex items-center gap-3">
                {diceValues.map((v, i) => (
                  <motion.button
                    key={i}
                    onClick={() => needChoose && setChosenIndex(i)}
                    className={`rounded-lg transition-all ${
                      needChoose && chosenIndex === i
                        ? 'ring-2 ring-cheese-400 ring-offset-2 ring-offset-card scale-110'
                        : ''
                    }`}
                    whileTap={needChoose ? { scale: 0.95 } : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 + i * 0.15 }}
                  >
                    <DiceFace value={v} size={56} />
                  </motion.button>
                ))}
              </div>

              {needChoose && (
                <p className="text-xs text-cheese-400 text-center font-medium">
                  选择一个点数作为你的醒来点数
                </p>
              )}
              {!needChoose && hasTwoDice && role === Role.THIEF && (
                <p className="text-xs text-muted-foreground text-center">
                  记住你的点数，不需要选择
                </p>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="w-full max-w-[300px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.2 }}
      >
        <Button
          onClick={handleReady}
          disabled={ready || (needChoose && chosenIndex === null)}
          className="w-full"
          size="lg"
        >
          {ready ? '等待中...' : '我记住了'}
        </Button>
      </motion.div>
    </div>
    </div>
  )
}
