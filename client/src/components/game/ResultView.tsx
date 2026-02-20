import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/hooks/useGameStore'
import { getSocket } from '@/lib/socket'
import { C2S } from '@shared/events'
import { Role, Team } from '@shared/types'
import SleepyMouse from '@/assets/characters/SleepyMouse'
import ThiefMouse from '@/assets/characters/ThiefMouse'
import ScapegoatMouse from '@/assets/characters/ScapegoatMouse'
import Cheese from '@/assets/characters/Cheese'
import DiceFace from '@/assets/characters/DiceFace'

const ROLE_LABELS: Record<string, string> = {
  [Role.THIEF]: '奶酪大盗',
  [Role.SLEEPY]: '贪睡鼠',
  [Role.SCAPEGOAT]: '背锅鼠',
}

const TEAM_COLORS: Record<string, string> = {
  [Team.GOOD]: 'text-green-400',
  [Team.EVIL]: 'text-red-400',
  [Team.NEUTRAL]: 'text-purple-400',
}

const TEAM_GLOWS: Record<string, string> = {
  [Team.GOOD]: '0 0 60px rgba(34,197,94,0.3)',
  [Team.EVIL]: '0 0 60px rgba(239,68,68,0.3)',
  [Team.NEUTRAL]: '0 0 60px rgba(168,85,247,0.3)',
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  [Role.THIEF]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [Role.SLEEPY]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [Role.SCAPEGOAT]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function SmallRoleIcon({ role }: { role: string }) {
  switch (role) {
    case Role.THIEF: return <ThiefMouse size={28} />
    case Role.SLEEPY: return <SleepyMouse size={28} />
    case Role.SCAPEGOAT: return <ScapegoatMouse size={28} />
    default: return null
  }
}

function WinnerIcon({ team }: { team: string }) {
  switch (team) {
    case Team.GOOD: return <SleepyMouse size={80} />
    case Team.EVIL: return <ThiefMouse size={80} />
    case Team.NEUTRAL: return <ScapegoatMouse size={80} />
    default: return <Cheese size={80} />
  }
}

function Confetti() {
  const colors = ['#FBBF24', '#22C55E', '#EF4444', '#A855F7', '#3B82F6', '#FEF3C7']
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${5 + (i * 17) % 90}%`,
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${2 + (i % 3)}s linear ${i * 0.12}s infinite`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  )
}

export default function ResultView() {
  const players = useGameStore((s) => s.players)
  const myPlayerId = useGameStore((s) => s.myPlayerId)
  const result = useGameStore((s) => s.result)
  const me = players.find((p) => p.id === myPlayerId)
  const isHost = me?.isHost ?? false

  function handleBackToLobby() {
    getSocket().emit(C2S.BACK_TO_LOBBY)
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">正在结算...</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full px-4 py-4 gap-4 overflow-y-auto">
      <Confetti />

      {/* Winner banner */}
      <motion.div
        className="relative z-10 text-center py-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div
          className="inline-block rounded-2xl p-4"
          style={{ boxShadow: TEAM_GLOWS[result.winnerTeam] ?? 'none' }}
        >
          <WinnerIcon team={result.winnerTeam} />
        </div>
        <h2 className={`text-2xl font-bold mt-2 ${TEAM_COLORS[result.winnerTeam] ?? 'text-foreground'}`}>
          {result.winnerLabel}
        </h2>
      </motion.div>

      {/* Voted out players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="flex flex-col gap-2 pt-4">
            <p className="text-sm text-muted-foreground">被投出的玩家</p>
            {result.revealedPlayers.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex items-center justify-between py-2 px-2 rounded-lg bg-wood-950/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
              >
                <div className="flex items-center gap-2">
                  <SmallRoleIcon role={p.role} />
                  <span className="font-bold">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_BADGE_COLORS[p.role] ?? ''}`}>
                    {ROLE_LABELS[p.role] ?? p.role}
                  </span>
                  <span className="text-sm text-muted-foreground">{p.voteCount} 票</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* All players reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardContent className="flex flex-col gap-1.5 pt-4">
            <p className="text-sm text-muted-foreground">所有玩家</p>
            {result.allPlayers.map((p, i) => {
              const votedForName = result.allPlayers.find((x) => x.id === p.votedFor)?.name
              return (
                <motion.div
                  key={p.id}
                  className={`flex items-center justify-between py-2 px-2 rounded-lg ${
                    p.id === myPlayerId ? 'bg-cheese-400/10 border border-cheese-400/20' : 'bg-wood-950/20'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.08 }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SmallRoleIcon role={p.role} />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${p.id === myPlayerId ? 'font-bold text-cheese-200' : ''}`}>
                          {p.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ROLE_BADGE_COLORS[p.role] ?? ''}`}>
                          {ROLE_LABELS[p.role] ?? p.role}
                        </span>
                        {p.isAccomplice && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">帮凶</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {p.diceValues.map((d, di) => (
                          <DiceFace key={di} value={d} size={18} />
                        ))}
                        {votedForName && (
                          <span className="text-[10px] text-muted-foreground ml-1">投给 {votedForName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Back to lobby */}
      <motion.div
        className="pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {isHost ? (
          <Button onClick={handleBackToLobby} className="w-full" size="lg">
            返回大厅
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            等待房主返回大厅...
          </p>
        )}
      </motion.div>
    </div>
  )
}
