import { BrowserRouter, Routes, Route } from 'react-router'
import MobileContainer from '@/components/layout/MobileContainer'
import HomePage from '@/pages/HomePage'
import LobbyPage from '@/pages/LobbyPage'
import GamePage from '@/pages/GamePage'
import SvgPreview from '@/pages/SvgPreview'
import VoiceOverlay from '@/components/VoiceOverlay'
import { useGameStore } from '@/hooks/useGameStore'

function VoiceLayer() {
  const roomCode = useGameStore((s) => s.roomCode)
  if (!roomCode) return null
  return <VoiceOverlay />
}

function App() {
  return (
    <BrowserRouter>
      <MobileContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby/:roomCode" element={<LobbyPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="/preview" element={<SvgPreview />} />
        </Routes>
      </MobileContainer>
      <VoiceLayer />
    </BrowserRouter>
  )
}

export default App
