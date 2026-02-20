import { useEffect, useRef } from 'react'
import { getSocket, connectSocket } from '@/lib/socket'
import { useGameStore } from './useGameStore'
import { C2S, S2C } from '@shared/events'
import type { ClientGameState } from '@shared/types'

export function useSocket() {
  const updateGameState = useGameStore((s) => s.updateGameState)
  const setRoomCode = useGameStore((s) => s.setRoomCode)
  const setMyInfo = useGameStore((s) => s.setMyInfo)
  const setSessionToken = useGameStore((s) => s.setSessionToken)
  const pendingReconnect = useRef(false)

  useEffect(() => {
    const socket = getSocket()
    connectSocket()

    socket.on('connect', () => {
      const { sessionToken, roomCode } = useGameStore.getState()
      if (sessionToken && roomCode) {
        console.log('[socket] reconnecting to room', roomCode)
        pendingReconnect.current = true
        socket.emit(C2S.RECONNECT, { sessionToken, roomCode })
      }
    })

    socket.on(S2C.ROOM_STATE, (data: { roomCode: string; playerId: string; sessionToken: string }) => {
      pendingReconnect.current = false
      setRoomCode(data.roomCode)
      setMyInfo(data.playerId, useGameStore.getState().myName ?? '')
      setSessionToken(data.sessionToken)
    })

    socket.on(S2C.GAME_STATE, (state: ClientGameState) => {
      pendingReconnect.current = false
      console.log('[socket] GAME_STATE received, phase:', state.phase, 'players:', state.players?.length)
      updateGameState(state)
    })

    socket.on(S2C.ERROR, (data: { message: string }) => {
      console.error('[socket] error:', data.message)
      if (pendingReconnect.current) {
        console.log('[socket] reconnect failed, clearing session')
        pendingReconnect.current = false
        useGameStore.getState().reset()
      }
    })

    return () => {
      socket.off('connect')
      socket.off(S2C.ROOM_STATE)
      socket.off(S2C.GAME_STATE)
      socket.off(S2C.ERROR)
    }
  }, [updateGameState, setRoomCode, setMyInfo, setSessionToken])

  return getSocket()
}
