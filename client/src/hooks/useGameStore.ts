import { create } from 'zustand'
import type {
  ClientGameState,
  ClientPlayer,
  GameSettings,
  ClientNightState,
  ClientAccompliceState,
  ClientDayState,
  ClientVoteState,
  ClientResultState,
} from '@shared/types'
import { GamePhase } from '@shared/types'
import {
  DEFAULT_ACCOMPLICE_SELECT_SECONDS,
  DEFAULT_DAY_DISCUSSION_SECONDS,
  DEFAULT_NIGHT_ACTION_SECONDS,
  DEFAULT_VOTING_SECONDS,
} from '@shared/constants'

interface GameStore {
  roomCode: string | null
  phase: GamePhase
  players: ClientPlayer[]
  settings: GameSettings
  night: ClientNightState | null
  accomplice: ClientAccompliceState | null
  day: ClientDayState | null
  vote: ClientVoteState | null
  result: ClientResultState | null

  myPlayerId: string | null
  myName: string | null
  sessionToken: string | null

  setMyInfo: (id: string, name: string) => void
  setSessionToken: (token: string) => void
  setRoomCode: (code: string | null) => void
  updateGameState: (state: ClientGameState) => void
  reset: () => void
}

const initialSettings: GameSettings = {
  useScapegoat: false,
  nightActionSeconds: DEFAULT_NIGHT_ACTION_SECONDS,
  accompliceSelectSeconds: DEFAULT_ACCOMPLICE_SELECT_SECONDS,
  dayDiscussionSeconds: DEFAULT_DAY_DISCUSSION_SECONDS,
  votingSeconds: DEFAULT_VOTING_SECONDS,
}

export const useGameStore = create<GameStore>((set) => ({
  roomCode: sessionStorage.getItem('roomCode'),
  phase: GamePhase.LOBBY,
  players: [],
  settings: initialSettings,
  night: null,
  accomplice: null,
  day: null,
  vote: null,
  result: null,

  myPlayerId: null,
  myName: sessionStorage.getItem('myName'),
  sessionToken: sessionStorage.getItem('sessionToken'),

  setMyInfo: (id, name) => {
    sessionStorage.setItem('myName', name)
    set({ myPlayerId: id, myName: name })
  },

  setSessionToken: (token) => {
    sessionStorage.setItem('sessionToken', token)
    set({ sessionToken: token })
  },

  setRoomCode: (code) => {
    if (code) {
      sessionStorage.setItem('roomCode', code)
    } else {
      sessionStorage.removeItem('roomCode')
    }
    set({ roomCode: code })
  },

  updateGameState: (state) =>
    set({
      roomCode: state.roomCode,
      phase: state.phase,
      players: state.players,
      settings: state.settings,
      night: state.night,
      accomplice: state.accomplice,
      day: state.day,
      vote: state.vote,
      result: state.result,
    }),

  reset: () => {
    sessionStorage.removeItem('sessionToken')
    sessionStorage.removeItem('roomCode')
    sessionStorage.removeItem('myName')
    set({
      roomCode: null,
      phase: GamePhase.LOBBY,
      players: [],
      settings: initialSettings,
      night: null,
      accomplice: null,
      day: null,
      vote: null,
      result: null,
      myPlayerId: null,
      myName: null,
      sessionToken: null,
    })
  },
}))
