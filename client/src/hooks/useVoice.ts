import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { useGameStore } from '@/hooks/useGameStore'
import { GamePhase } from '@shared/types'
import {
  getVoiceState,
  subscribeVoice,
  connectVoice,
  disconnectVoice,
  toggleVoiceMute,
  forceLocalMute,
} from '@/lib/voice'

/** Phases where ALL players may optionally speak */
const ALL_SPEAK = new Set<string>([
  GamePhase.LOBBY,
  GamePhase.DAY,
  GamePhase.RESULT,
])

/** Phases where NOBODY may speak */
const MUTED_PHASES = new Set<string>([
  GamePhase.VOTING,
  GamePhase.DEALING,
  GamePhase.ACCOMPLICE,
])

export function useVoice() {
  const voiceState = useSyncExternalStore(subscribeVoice, getVoiceState)
  const phase = useGameStore((s) => s.phase)
  const night = useGameStore((s) => s.night)
  const myPlayerId = useGameStore((s) => s.myPlayerId)

  // Determine if this player can speak in the current phase
  let canSpeak = false
  if (ALL_SPEAK.has(phase)) {
    canSpeak = true
  } else if (phase === GamePhase.NIGHT && night && myPlayerId) {
    // Only awake players can speak during night
    canSpeak = night.awakePlayerIds.includes(myPlayerId)
  } else if (MUTED_PHASES.has(phase)) {
    canSpeak = false
  }

  // Force mute when canSpeak transitions to false
  useEffect(() => {
    if (!voiceState.connected) return
    if (!canSpeak) {
      forceLocalMute()
    }
  }, [canSpeak, voiceState.connected])

  // Single button: first press connects, subsequent presses toggle mute
  const onMicPress = useCallback(async () => {
    if (!voiceState.connected && !voiceState.connecting) {
      connectVoice()
      return
    }
    if (voiceState.connected && canSpeak) {
      await toggleVoiceMute()
    }
  }, [voiceState.connected, voiceState.connecting, canSpeak])

  return {
    ...voiceState,
    canSpeak,
    onMicPress,
    disconnect: disconnectVoice,
  }
}
