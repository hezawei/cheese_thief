import type React from 'react'
import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGameStore } from '@/hooks/useGameStore'
import { useSocket } from '@/hooks/useSocket'
import { GamePhase } from '@shared/types'
import { audioManager } from '@/audio/AudioManager'
import DealingView from '@/components/game/DealingView'
import NightView from '@/components/game/NightView'
import AccompliceView from '@/components/game/AccompliceView'
import DayView from '@/components/game/DayView'
import VoteView from '@/components/game/VoteView'
import ResultView from '@/components/game/ResultView'
import PhaseTransition from '@/components/animations/PhaseTransition'

export default function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  useSocket()

  const phase = useGameStore((s) => s.phase)
  const storeRoomCode = useGameStore((s) => s.roomCode)
  const prevPhase = useRef(phase)

  useEffect(() => {
    if (phase === GamePhase.LOBBY && roomCode) {
      navigate(`/lobby/${roomCode}`)
    }
  }, [phase, roomCode, navigate])

  useEffect(() => {
    if (prevPhase.current !== phase) {
      if (phase === GamePhase.RESULT) {
        audioManager.playSfx('victory')
      } else {
        audioManager.playSfx('phaseTransition')
      }
      prevPhase.current = phase
    }
  }, [phase])

  if (!storeRoomCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <p className="text-muted-foreground">连接中...</p>
      </div>
    )
  }

  const debugBar = (
    <div className="absolute top-0 left-0 right-0 bg-black/80 text-xs text-white px-2 py-1 z-50">
      phase={phase} | room={storeRoomCode} | me={useGameStore.getState().myPlayerId?.slice(-6)}
    </div>
  )

  let content: React.ReactNode
  switch (phase) {
    case GamePhase.DEALING:
      content = <>{debugBar}<DealingView /></>
      break
    case GamePhase.NIGHT:
      content = <NightView />
      break
    case GamePhase.ACCOMPLICE:
      content = <AccompliceView />
      break
    case GamePhase.DAY:
      content = <DayView />
      break
    case GamePhase.VOTING:
      content = <VoteView />
      break
    case GamePhase.RESULT:
      content = <ResultView />
      break
    default:
      content = (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      )
  }

  return <PhaseTransition phaseKey={phase}>{content}</PhaseTransition>
}
