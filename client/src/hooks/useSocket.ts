import { useEffect } from 'react'
import { getSocket, connectSocket } from '@/lib/socket'
import { useGameStore } from './useGameStore'
import { S2C } from '@shared/events'
import type { ClientGameState } from '@shared/types'

export function useSocket() {
  const updateGameState = useGameStore((s) => s.updateGameState)
  const setRoomCode = useGameStore((s) => s.setRoomCode)
  const setMyInfo = useGameStore((s) => s.setMyInfo)
  const setSessionToken = useGameStore((s) => s.setSessionToken)

  useEffect(() => {
    const socket = getSocket()
    connectSocket()

    socket.on(S2C.ROOM_STATE, (data: { roomCode: string; playerId: string; sessionToken: string }) => {
      setRoomCode(data.roomCode)
      setMyInfo(data.playerId, useGameStore.getState().myName ?? '')
      setSessionToken(data.sessionToken)
    })

    socket.on(S2C.GAME_STATE, (state: ClientGameState) => {
      console.log('[socket] GAME_STATE received, phase:', state.phase, 'players:', state.players?.length)
      updateGameState(state)
    })

    socket.on(S2C.ERROR, (data: { message: string }) => {
      console.error('[socket] error:', data.message)
    })

    return () => {
      socket.off(S2C.ROOM_STATE)
      socket.off(S2C.GAME_STATE)
      socket.off(S2C.ERROR)
    }
  }, [updateGameState, setRoomCode, setMyInfo, setSessionToken])

  return getSocket()
}
