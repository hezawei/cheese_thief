import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGameStore } from '@/hooks/useGameStore'
import { getSocket } from '@/lib/socket'
import { C2S, S2C } from '@shared/events'
import type { ChatMessage } from '@shared/types'

export default function DayView() {
  const myPlayerId = useGameStore((s) => s.myPlayerId)
  const settings = useGameStore((s) => s.settings)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [remaining, setRemaining] = useState(settings.dayDiscussionSeconds)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = getSocket()
    socket.on(S2C.DAY_NEW_MESSAGE, (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })
    return () => {
      socket.off(S2C.DAY_NEW_MESSAGE)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleSend() {
    if (!input.trim()) return
    getSocket().emit(C2S.SEND_MESSAGE, { content: input.trim() })
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-muted">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-cheese-400">白天讨论</h2>
          <span className={`text-sm font-mono ${remaining < 30 ? 'text-red-400' : 'text-muted-foreground'}`}>
            {timeStr}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          讨论谁是奶酪大盗！时间结束后将进入投票。
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {messages.map((msg) => {
          const isMine = msg.playerId === myPlayerId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                isMine ? 'bg-cheese-400/20 text-foreground' : 'bg-muted text-foreground'
              }`}>
                {!isMine && (
                  <p className="text-xs text-muted-foreground mb-1">{msg.playerName}</p>
                )}
                <p>{msg.content}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-muted flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          maxLength={200}
          className="flex-1"
        />
        <Button onClick={handleSend} size="sm" disabled={!input.trim()}>
          发送
        </Button>
      </div>
    </div>
  )
}
