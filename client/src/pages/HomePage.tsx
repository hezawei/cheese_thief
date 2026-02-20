import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useSocket } from '@/hooks/useSocket'
import { C2S, S2C } from '@shared/events'

const AVATAR_COUNT = 8

export default function HomePage() {
  const navigate = useNavigate()
  const socket = useSocket()
  const [name, setName] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const avatarIndex = Math.floor(Math.random() * AVATAR_COUNT)

  function handleCreate() {
    if (!name.trim()) {
      setError('请输入你的名字')
      return
    }
    setError('')
    setLoading(true)

    socket.once(S2C.ROOM_STATE, (data: { roomCode: string }) => {
      setLoading(false)
      navigate(`/lobby/${data.roomCode}`)
    })

    socket.once(S2C.ERROR, (data: { message: string }) => {
      setLoading(false)
      setError(data.message)
    })

    socket.emit(C2S.CREATE_ROOM, { name: name.trim(), avatarIndex })
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
    setError('')
    setLoading(true)

    socket.once(S2C.ROOM_STATE, (data: { roomCode: string }) => {
      setLoading(false)
      navigate(`/lobby/${data.roomCode}`)
    })

    socket.once(S2C.ERROR, (data: { message: string }) => {
      setLoading(false)
      setError(data.message)
    })

    socket.emit(C2S.JOIN_ROOM, {
      roomCode: joinCode.trim().toUpperCase(),
      name: name.trim(),
      avatarIndex,
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
