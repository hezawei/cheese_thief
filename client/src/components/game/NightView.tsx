import { useGameStore } from '@/hooks/useGameStore'
import NightScene from './night/NightScene'
import SleepingView from './night/SleepingView'

export default function NightView() {
  const night = useGameStore((s) => s.night)

  if (!night) return null

  if (!night.isYourTurn) {
    return <SleepingView currentDice={night.currentDice} remainingSeconds={night.remainingSeconds} />
  }

  return <NightScene night={night} />
}
