import { Mic, MicOff } from 'lucide-react'
import { useGameStore } from '@/hooks/useGameStore'
import { useVoice } from '@/hooks/useVoice'

export default function VoiceOverlay() {
  const players = useGameStore((s) => s.players)
  const {
    connected,
    connecting,
    localMuted,
    activeSpeakers,
    canSpeak,
    error,
    onMicPress,
  } = useVoice()

  const micActive = connected && !localMuted && canSpeak
  const disabled = connecting || (connected && !canSpeak)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Active speakers */}
      {connected && activeSpeakers.size > 0 && (
        <div className="bg-background/90 backdrop-blur rounded-lg px-3 py-2 border border-border text-xs">
          <div className="flex flex-wrap gap-1">
            {Array.from(activeSpeakers).map((id) => {
              const player = players.find((p) => p.id === id)
              return player ? (
                <span key={id} className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
                  🎤 {player.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400 max-w-[200px]">
          {error}
        </div>
      )}

      {/* Single mic button */}
      <button
        className={`rounded-full w-12 h-12 flex items-center justify-center transition-all shadow-lg ${
          disabled
            ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
            : micActive
              ? 'bg-green-500/20 border-2 border-green-500/60 text-green-400 hover:bg-green-500/30'
              : 'bg-red-500/10 border-2 border-red-500/40 text-red-400 hover:bg-red-500/20'
        }`}
        onClick={onMicPress}
        disabled={disabled}
      >
        {connecting ? (
          <Mic className="w-5 h-5 animate-pulse" />
        ) : micActive ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
