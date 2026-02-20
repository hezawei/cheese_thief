import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { useGameStore } from '@/hooks/useGameStore'
import { audioManager } from './AudioManager'
import type { SfxKey } from './AudioManager'

/** Subscribe to audioManager mute state changes */
let listeners: Array<() => void> = []
let snapshotMuted = audioManager.muted

function subscribe(cb: () => void) {
  listeners.push(cb)
  return () => { listeners = listeners.filter((l) => l !== cb) }
}
function getSnapshot() { return snapshotMuted }
function notify() {
  snapshotMuted = audioManager.muted
  listeners.forEach((l) => l())
}

/**
 * Hook that:
 * 1. Auto-switches BGM based on game phase
 * 2. Provides playSfx and toggleMute controls
 * 3. Preloads audio on first user interaction
 */
export function useAudio() {
  const phase = useGameStore((s) => s.phase)
  const muted = useSyncExternalStore(subscribe, getSnapshot)

  // Preload on first user interaction (click/touch) — only once
  useEffect(() => {
    function unlock() {
      audioManager.preload()
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  // Switch BGM when phase changes (AudioManager queues if not yet loaded)
  useEffect(() => {
    audioManager.setPhase(phase)
  }, [phase])

  const toggleMute = useCallback(() => {
    audioManager.toggleMute()
    notify()
  }, [])

  const playSfx = useCallback((key: SfxKey) => {
    audioManager.playSfx(key)
  }, [])

  return { muted, toggleMute, playSfx }
}
