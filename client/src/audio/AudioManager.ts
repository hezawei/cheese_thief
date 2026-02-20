import { Howl, Howler } from 'howler'
import { GamePhase } from '@shared/types'

/* ── Audio file paths (relative to /public) ── */
/* Howler tries each src in order; put both formats so either works */
const EXTS = ['.mp3', '.flac', '.ogg', '.wav'] as const

function audioSrc(name: string): string[] {
  return EXTS.map((ext) => `/audio/${name}${ext}`)
}

const BGM = {
  lobby:  audioSrc('bgm-lobby'),
  night:  audioSrc('bgm-night'),
  day:    audioSrc('bgm-day'),
  vote:   audioSrc('bgm-vote'),
  result: audioSrc('bgm-result'),
} as const

const SFX = {
  phaseTransition: audioSrc('sfx-transition'),
  steal:           audioSrc('sfx-steal'),
  diceReveal:      audioSrc('sfx-dice-reveal'),
  voteConfirm:     audioSrc('sfx-vote'),
  tick:            audioSrc('sfx-tick'),
  victory:         audioSrc('sfx-victory'),
  click:           audioSrc('sfx-click'),
  warning:         audioSrc('sfx-warning'),
} as const

type BgmKey = keyof typeof BGM
type SfxKey = keyof typeof SFX

const PHASE_BGM: Partial<Record<GamePhase, BgmKey>> = {
  [GamePhase.LOBBY]:      'lobby',
  [GamePhase.DEALING]:    'lobby',
  [GamePhase.NIGHT]:      'night',
  [GamePhase.ACCOMPLICE]: 'night',
  [GamePhase.DAY]:        'day',
  [GamePhase.VOTING]:     'vote',
  [GamePhase.RESULT]:     'result',
}

const FADE_MS = 800
const DEFAULT_BGM_VOLUME = 0.35
const DEFAULT_SFX_VOLUME = 0.6

class AudioManager {
  private bgmHowls = new Map<BgmKey, Howl>()
  private sfxHowls = new Map<SfxKey, Howl>()
  private currentBgm: BgmKey | null = null
  private _muted = false
  private _bgmVolume = DEFAULT_BGM_VOLUME
  private _sfxVolume = DEFAULT_SFX_VOLUME
  private _unlocked = false

  constructor() {
    this._muted = localStorage.getItem('audioMuted') === 'true'
    const savedBgmVol = localStorage.getItem('bgmVolume')
    const savedSfxVol = localStorage.getItem('sfxVolume')
    if (savedBgmVol) this._bgmVolume = parseFloat(savedBgmVol)
    if (savedSfxVol) this._sfxVolume = parseFloat(savedSfxVol)

    if (this._muted) {
      Howler.mute(true)
    }
  }

  /** Preload all audio. Call once after first user interaction. */
  preload(): void {
    if (this._unlocked) return
    this._unlocked = true

    for (const [key, src] of Object.entries(BGM)) {
      try {
        const howl = new Howl({
          src,
          loop: true,
          volume: this._bgmVolume,
          preload: true,
          html5: true,
          onloaderror: () => {
            console.warn(`[audio] BGM "${key}" not found: ${src}`)
            this.bgmHowls.delete(key as BgmKey)
          },
        })
        this.bgmHowls.set(key as BgmKey, howl)
      } catch { /* skip */ }
    }

    for (const [key, src] of Object.entries(SFX)) {
      try {
        const howl = new Howl({
          src,
          volume: this._sfxVolume,
          preload: true,
          onloaderror: () => {
            console.warn(`[audio] SFX "${key}" not found: ${src}`)
            this.sfxHowls.delete(key as SfxKey)
          },
        })
        this.sfxHowls.set(key as SfxKey, howl)
      } catch { /* skip */ }
    }
  }

  /** Switch BGM based on game phase */
  setPhase(phase: GamePhase): void {
    const target = PHASE_BGM[phase] ?? null
    if (target === this.currentBgm) return
    this.crossfadeTo(target)
  }

  /** Play a one-shot sound effect */
  playSfx(key: SfxKey): void {
    if (!this._unlocked) return
    const howl = this.sfxHowls.get(key)
    if (howl) howl.play()
  }

  /** Crossfade from current BGM to new one */
  private crossfadeTo(target: BgmKey | null): void {
    const oldHowl = this.currentBgm ? this.bgmHowls.get(this.currentBgm) : null
    const newHowl = target ? this.bgmHowls.get(target) : null

    if (oldHowl) {
      oldHowl.fade(oldHowl.volume(), 0, FADE_MS)
      setTimeout(() => oldHowl.stop(), FADE_MS)
    }

    this.currentBgm = target

    if (newHowl) {
      newHowl.volume(0)
      newHowl.play()
      newHowl.fade(0, this._bgmVolume, FADE_MS)
    }
  }

  // ── Volume & mute controls ──

  get muted(): boolean { return this._muted }
  get bgmVolume(): number { return this._bgmVolume }
  get sfxVolume(): number { return this._sfxVolume }

  toggleMute(): boolean {
    this._muted = !this._muted
    Howler.mute(this._muted)
    localStorage.setItem('audioMuted', String(this._muted))
    return this._muted
  }

  setBgmVolume(vol: number): void {
    this._bgmVolume = Math.max(0, Math.min(1, vol))
    localStorage.setItem('bgmVolume', String(this._bgmVolume))
    const howl = this.currentBgm ? this.bgmHowls.get(this.currentBgm) : null
    if (howl) howl.volume(this._bgmVolume)
  }

  setSfxVolume(vol: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, vol))
    localStorage.setItem('sfxVolume', String(this._sfxVolume))
    for (const howl of this.sfxHowls.values()) {
      howl.volume(this._sfxVolume)
    }
  }

  /** Stop everything (for cleanup) */
  stopAll(): void {
    for (const howl of this.bgmHowls.values()) howl.stop()
    for (const howl of this.sfxHowls.values()) howl.stop()
    this.currentBgm = null
  }
}

export const audioManager = new AudioManager()
export type { SfxKey }
