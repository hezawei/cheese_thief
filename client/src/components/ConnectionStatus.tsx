import { useState, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'

export default function ConnectionStatus() {
  const [connected, setConnected] = useState(true)
  const [reconnecting, setReconnecting] = useState(false)
  const hasConnected = useRef(false)

  useEffect(() => {
    const socket = getSocket()

    const onConnect = () => {
      hasConnected.current = true
      setConnected(true)
      setReconnecting(false)
    }
    const onDisconnect = () => {
      if (hasConnected.current) {
        setConnected(false)
      }
    }
    const onReconnectAttempt = () => {
      setReconnecting(true)
    }

    if (socket.connected) {
      hasConnected.current = true
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.io.on('reconnect_attempt', onReconnectAttempt)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
    }
  }, [])

  if (connected) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center py-2 bg-destructive text-white text-xs font-medium">
      {reconnecting ? '连接断开，正在重连...' : '连接已断开'}
    </div>
  )
}
