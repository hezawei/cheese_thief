import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/hooks/useGameStore'
import { useSocket } from '@/hooks/useSocket'
import { C2S, S2C } from '@shared/events'
import { GamePhase } from '@shared/types'
import { MIN_PLAYERS } from '@shared/constants'

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const socket = useSocket()

  const players = useGameStore((s) => s.players)
  const settings = useGameStore((s) => s.settings)
  const phase = useGameStore((s) => s.phase)
  const myPlayerId = useGameStore((s) => s.myPlayerId)

  const me = players.find((p) => p.id === myPlayerId)
  const isHost = me?.isHost ?? false
  const canStart = players.length >= MIN_PLAYERS

  useEffect(() => {
    if (phase !== GamePhase.LOBBY && phase !== undefined && roomCode) {
      navigate(`/game/${roomCode}`)
    }
  }, [phase, roomCode, navigate])

  useEffect(() => {
    socket.on(S2C.PHASE_CHANGE, (data: { phase: string }) => {
      if (data.phase !== GamePhase.LOBBY && roomCode) {
        navigate(`/game/${roomCode}`)
      }
    })
    return () => {
      socket.off(S2C.PHASE_CHANGE)
    }
  }, [socket, roomCode, navigate])

  function handleCopyCode() {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
    }
  }

  function handleToggleScapegoat(checked: boolean) {
    socket.emit(C2S.UPDATE_SETTINGS, { useScapegoat: checked })
  }

  function handleStart() {
    socket.emit(C2S.START_GAME)
  }

  function handleLeave() {
    socket.emit(C2S.LEAVE_ROOM)
    useGameStore.getState().reset()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">房间</span>
          <span className="text-xl font-bold text-cheese-400 tracking-widest">
            {roomCode}
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={handleCopyCode}>
          复制
        </Button>
      </div>

      <Card className="flex-1 overflow-y-auto">
        <CardContent className="flex flex-col gap-3 pt-4">
          <p className="text-sm text-muted-foreground">
            玩家 ({players.length}/8)
          </p>
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-wood-950/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-cheese-400/20 flex items-center justify-center text-sm font-bold text-cheese-400"
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground">{p.name}</span>
                {p.isHost && (
                  <Badge variant="secondary" className="text-xs">房主</Badge>
                )}
              </div>
              <span className={p.isConnected ? 'text-good text-xs' : 'text-destructive text-xs'}>
                {p.isConnected ? '在线' : '离线'}
              </span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, MIN_PLAYERS - players.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center py-2 px-3 rounded-lg border border-dashed border-muted"
            >
              <span className="text-muted-foreground text-sm">等待加入...</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {isHost && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-4">
            <p className="text-sm text-muted-foreground">设置</p>
            {players.length >= 6 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">背锅鼠</span>
                <Switch
                  checked={settings.useScapegoat}
                  onCheckedChange={handleToggleScapegoat}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 pb-2">
        {isHost && (
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full text-base"
            size="lg"
          >
            {canStart
              ? '开始游戏'
              : `还需 ${MIN_PLAYERS - players.length} 人`}
          </Button>
        )}
        <Button variant="secondary" onClick={handleLeave} className="w-full" size="sm">
          退出房间
        </Button>
      </div>
    </div>
  )
}
