import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/hooks/useGameStore'
import { useSocket } from '@/hooks/useSocket'
import { C2S, S2C } from '@shared/events'
import { GamePhase } from '@shared/types'

const AVATAR_COUNT = 8

export default function HomePage() {
  const navigate = useNavigate()
  const socket = useSocket()
  const storedRoomCode = useGameStore((s) => s.roomCode)
  const phase = useGameStore((s) => s.phase)
  const storedName = useGameStore((s) => s.myName)
  const [name, setName] = useState(storedName ?? '')

  useEffect(() => {
    if (storedRoomCode) {
      if (phase !== GamePhase.LOBBY) {
        navigate(`/game/${storedRoomCode}`)
      } else {
        navigate(`/lobby/${storedRoomCode}`)
      }
    }
  }, [storedRoomCode, phase, navigate])
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const avatarIndex = Math.floor(Math.random() * AVATAR_COUNT)

  function emitWithTimeout(emitFn: () => void) {
    if (!socket.connected) {
      setError('未连接到服务器，请检查网络后刷新页面')
      return
    }
    setError('')
    setLoading(true)

    const timeout = setTimeout(() => {
      socket.off(S2C.ROOM_STATE)
      socket.off(S2C.ERROR)
      setLoading(false)
      setError('服务器无响应，请刷新页面重试')
    }, 10_000)

    socket.once(S2C.ROOM_STATE, (data: { roomCode: string }) => {
      clearTimeout(timeout)
      socket.off(S2C.ERROR)
      setLoading(false)
      navigate(`/lobby/${data.roomCode}`)
    })

    socket.once(S2C.ERROR, (data: { message: string }) => {
      clearTimeout(timeout)
      socket.off(S2C.ROOM_STATE)
      setLoading(false)
      setError(data.message)
    })

    emitFn()
  }

  function handleCreate() {
    if (!name.trim()) {
      setError('请输入你的名字')
      return
    }
    emitWithTimeout(() => {
      socket.emit(C2S.CREATE_ROOM, { name: name.trim(), avatarIndex })
    })
  }

  function handleJoin() {
    if (!name.trim()) {
      setError('请输入你的名字')
      return
    }
    if (!joinCode.trim()) {
      setError('请输入房间号')
      return
    }
    emitWithTimeout(() => {
      socket.emit(C2S.JOIN_ROOM, {
        roomCode: joinCode.trim().toUpperCase(),
        name: name.trim(),
        avatarIndex,
      })
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cheese-400 mb-1">
          奶酪大盗
        </h1>
        <p className="text-sm text-muted-foreground">线上桌游</p>
      </div>

      <Card className="w-full max-w-[320px]">
        <CardContent className="flex flex-col gap-4 pt-6">
          <Input
            placeholder="输入你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            className="text-center text-lg"
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full text-base"
            size="lg"
          >
            创建房间
          </Button>

          {!showJoin ? (
            <Button
              variant="secondary"
              onClick={() => setShowJoin(true)}
              className="w-full text-base"
              size="lg"
            >
              加入房间
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="房间号"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="text-center text-lg tracking-widest"
              />
              <Button
                onClick={handleJoin}
                disabled={loading}
                className="w-full text-base"
                size="lg"
              >
                加入
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
