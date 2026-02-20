import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/audio/useAudio'

export default function AudioToggle() {
  const { muted, toggleMute } = useAudio()

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
      aria-label={muted ? '开启声音' : '关闭声音'}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  )
}
