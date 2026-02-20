import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/hooks/useGameStore'
import { getSocket } from '@/lib/socket'
import { C2S } from '@shared/events'
import { Role } from '@shared/types'
import { audioManager } from '@/audio/AudioManager'

export default function AccompliceView() {
  const players = useGameStore((s) => s.players)
  const myPlayerId = useGameStore((s) => s.myPlayerId)
  const accomplice = useGameStore((s) => s.accomplice)
  const settings = useGameStore((s) => s.settings)
  const me = players.find((p) => p.id === myPlayerId)
  const isThief = me?.role === Role.THIEF

  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [countdown, setCountdown] = useState(settings.accompliceSelectSeconds)

  useEffect(() => {
    setCountdown(settings.accompliceSelectSeconds)
  }, [settings.accompliceSelectSeconds])

  useEffect(() => {
    if (countdown <= 0) return
    const tid = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(tid)
  }, [countdown > 0])

  function toggleSelect(id: string) {
    if (!accomplice) return
    audioManager.playSfx('click')
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id))
    } else if (selected.length < accomplice.selectCount) {
      setSelected([...selected, id])
    }
  }

  function handleSubmit() {
    if (!accomplice || selected.length !== accomplice.selectCount) return
    setSubmitted(true)
    audioManager.playSfx('voteConfirm')
    getSocket().emit(C2S.ACCOMPLICE_SELECT, { targetIds: selected })
  }

  // Accomplice reveal screen
  if (accomplice?.youAreAccomplice) {
    return (
      <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8">
        <h2 className="text-xl font-bold text-red-400">你是帮凶！</h2>
        <Card className="w-full max-w-[300px]">
          <CardContent className="flex flex-col gap-2 pt-4 text-center">
            {accomplice.knownThiefName && (
              <p className="text-sm">
                奶酪大盗是 <span className="font-bold text-red-400">{accomplice.knownThiefName}</span>
              </p>
            )}
            {accomplice.knownAccompliceNames.length > 0 && (
              <p className="text-sm">
                其他帮凶：<span className="font-bold text-red-400">{accomplice.knownAccompliceNames.join(', ')}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">记住这些信息！</p>
          </CardContent>
        </Card>
      </div>
      </div>
    )
  }

  // Thief selection screen
  if (isThief && accomplice?.isThiefSelecting && accomplice.candidates.length > 0) {
    return (
      <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8">
        <h2 className="text-xl font-bold text-red-400">选择帮凶</h2>
        <p className="text-sm text-muted-foreground">选择 {accomplice.selectCount} 人</p>
        {accomplice.isThiefSelecting && countdown > 0 && (
          <p className={`text-xs font-mono ${countdown < 10 ? 'text-red-400' : 'text-muted-foreground'}`}>
            {countdown}s
          </p>
        )}
        <Card className="w-full max-w-[300px]">
          <CardContent className="flex flex-col gap-2 pt-4">
            {accomplice.candidates.map((c) => (
              <Button
                key={c.id}
                variant={selected.includes(c.id) ? 'default' : 'secondary'}
                onClick={() => toggleSelect(c.id)}
                disabled={submitted}
                className="w-full"
              >
                {c.name}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Button
          onClick={handleSubmit}
          disabled={submitted || selected.length !== accomplice.selectCount}
          className="w-full max-w-[300px]"
          size="lg"
        >
          {submitted ? '等待中...' : '确认'}
        </Button>
      </div>
      </div>
    )
  }

  // Waiting screen (non-thief or thief after submitting)
  return (
    <div className="h-full overflow-y-auto">
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6 py-8">
      <h2 className="text-xl font-bold text-cheese-400">秘密会议</h2>
      <p className="text-muted-foreground text-center text-sm">
        奶酪大盗正在选择帮凶...
      </p>
      {accomplice?.isThiefSelecting && countdown > 0 && (
        <p className={`text-xs font-mono ${countdown < 10 ? 'text-red-400/60' : 'text-muted-foreground/50'}`}>
          {countdown}s
        </p>
      )}
    </div>
    </div>
  )
}
