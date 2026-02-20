import { Room, RoomEvent, Track, ConnectionState, type Participant, type RemoteTrackPublication, type RemoteTrack } from 'livekit-client'
import { getSocket } from './socket'
import { C2S, S2C } from '@shared/events'

type VoiceListener = (state: VoiceSnapshot) => void

export interface VoiceSnapshot {
  connected: boolean
  connecting: boolean
  localMuted: boolean
  activeSpeakers: Set<string>
  error: string | null
}

const INITIAL_STATE: VoiceSnapshot = {
  connected: false,
  connecting: false,
  localMuted: true,
  activeSpeakers: new Set(),
  error: null,
}

let room: Room | null = null
let state: VoiceSnapshot = { ...INITIAL_STATE }
const listeners = new Set<VoiceListener>()

function notify(): void {
  for (const fn of listeners) fn(state)
}

function update(patch: Partial<VoiceSnapshot>): void {
  state = { ...state, ...patch }
  notify()
}

export function getVoiceState(): VoiceSnapshot {
  return state
}

export function subscribeVoice(fn: VoiceListener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function connectVoice(): void {
  if (room || state.connecting) return

  const socket = getSocket()
  update({ connecting: true, error: null })

  const handler = async (data: { token: string | null; url: string | null }) => {
    socket.off(S2C.VOICE_TOKEN, handler)

    if (!data.token || !data.url) {
      update({ connecting: false })
      return
    }

    try {
      const newRoom = new Room({
        audioCaptureDefaults: { autoGainControl: true, noiseSuppression: true },
        adaptiveStream: true,
      })

      newRoom.on(RoomEvent.ConnectionStateChanged, (cs: ConnectionState) => {
        update({ connected: cs === ConnectionState.Connected, connecting: false })
      })

      newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        update({ activeSpeakers: new Set(speakers.map((s) => s.identity)) })
      })

      newRoom.on(RoomEvent.Disconnected, () => {
        room = null
        update({ connected: false, connecting: false, activeSpeakers: new Set() })
      })

      newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach()
          el.id = `voice-${track.sid}`
          el.style.display = 'none'
          document.body.appendChild(el)
        }
      })

      newRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove())
      })

      await newRoom.connect(data.url, data.token)
      await newRoom.startAudio()
      room = newRoom
      await newRoom.localParticipant.setMicrophoneEnabled(true)
      update({ localMuted: false })
    } catch (err) {
      update({ connecting: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  socket.on(S2C.VOICE_TOKEN, handler)
  socket.emit(C2S.REQUEST_VOICE_TOKEN)
}

export function disconnectVoice(): void {
  if (room) {
    room.disconnect()
    room = null
  }
  state = { ...INITIAL_STATE }
  notify()
}

export async function toggleVoiceMute(): Promise<void> {
  if (!room) return
  const pub = room.localParticipant.getTrackPublication(Track.Source.Microphone)
  if (!pub?.track) return

  if (pub.isMuted) {
    await pub.unmute()
    update({ localMuted: false })
  } else {
    await pub.mute()
    update({ localMuted: true })
  }
}

export async function forceLocalMute(): Promise<void> {
  if (!room) return
  const pub = room.localParticipant.getTrackPublication(Track.Source.Microphone)
  if (pub?.track && !pub.isMuted) {
    await pub.mute()
    update({ localMuted: true })
  }
}

export async function toggleVoice(): Promise<void> {
  if (!room && !state.connecting) {
    connectVoice()
    return
  }
  if (room) {
    await toggleVoiceMute()
  }
}
