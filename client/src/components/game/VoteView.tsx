import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/hooks/useGameStore'
import { getSocket } from '@/lib/socket'
import { C2S, S2C } from '@shared/events'
import { audioManager } from '@/audio/AudioManager'

export default function VoteView() {
  const players = useGameStore((s) => s.players)
  const myPlayerId = useGameStore((s) => s.myPlayerId)
  const settings = useGameStore((s) => s.settings)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [votedCount, setVotedCount] = useState(0)
  const [remaining, setRemaining] = useState(settings.votingSeconds)

  const candidates = players.filter((p) => p.id !== myPlayerId)

  useEffect(() => {
    const socket = getSocket()
    socket.on(S2C.VOTE_UPDATE, (data: { votedCount: number; totalCount: number }) => {
      setVotedCount(data.votedCount)
    })
    return () => {
      socket.off(S2C.VOTE_UPDATE)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1)
        if (next > 0 && next <= 5) audioManager.playSfx('tick')
        if (next === 3) audioManager.playSfx('warning')
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleVote() {
    if (!selectedId || voted) return
    setVoted(true)
    audioManager.playSfx('voteConfirm')
    getSocket().emit(C2S.CAST_VOTE, { targetId: selectedId })
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8">
      <h2 className="text-xl font-bold text-cheese-400">投票</h2>
      <p className="text-xs text-muted-foreground text-center max-w-[280px]">
        投出你认为是奶酪大盗的人！得票最多的玩家将被淘汰。
      </p>
      <p className="text-sm text-muted-foreground">
        {remaining}秒 - 已投 {votedCount}/{players.length}
      </p>

      <Card className="w-full max-w-[300px]">
        <CardContent className="flex flex-col gap-2 pt-4">
          {candidates.map((p) => (
            <Button
              key={p.id}
              variant={selectedId === p.id ? 'default' : 'secondary'}
              onClick={() => !voted && setSelectedId(p.id)}
              disabled={voted}
              className="w-full"
            >
              {p.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={handleVote}
        disabled={voted || !selectedId}
        className="w-full max-w-[300px]"
        size="lg"
      >
        {voted ? '等待其他人投票...' : '确认投票'}
      </Button>
    </div>
    </div>
  )
}
