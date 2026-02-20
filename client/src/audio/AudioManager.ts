import { Howl, Howler } from 'howler'
import { GamePhase } from '@shared/types'

/* ── Audio config ── */
const EXTS = ['.mp3', '.flac', '.ogg', '.wav']

const BGM_NAMES = {
  lobby:  'bgm-lobby',
  night:  'bgm-night',
  day:    'bgm-day',
  vote:   'bgm-vote',
  result: 'bgm-result',
} as const

const SFX_NAMES = {
  phaseTransition: 'sfx-transition',
  steal:           'sfx-steal',
  diceReveal:      'sfx-dice-reveal',
  voteConfirm:     'sfx-vote',
  tick:            'sfx-tick',
  victory:         'sfx-victory',
  click:           'sfx-click',
  warning:         'sfx-warning',
} as const

type BgmKey = keyof typeof BGM_NAMES
type SfxKey = keyof typeof SFX_NAMES

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
  private _pendingPhase: GamePhase | null = null

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

  /**
   * Try loading an audio file with format fallback.
   * Tries .mp3 → .flac → .ogg → .wav; uses the first that loads.
   */
  private loadWithFallback(
    fileName: string,
    opts: { loop: boolean; volume: number },
    onSuccess: (howl: Howl) => void,
  ): void {
    let idx = 0
    const tryNext = (): void => {
      if (idx >= EXTS.length) return // no format found, skip silently
      const url = `/audio/${fileName}${EXTS[idx]}`
      idx++
      const howl = new Howl({
        src: [url],
        loop: opts.loop,
        volume: opts.volume,
        preload: true,
        onload: () => onSuccess(howl),
        onloaderror: () => {
          howl.unload()
          tryNext()
        },
      })
    }
    tryNext()
  }

  /** Preload all audio. Call once after first user interaction. */
  preload(): void {
    if (this._unlocked) return
    this._unlocked = true

    for (const [key, fileName] of Object.entries(BGM_NAMES)) {
      this.loadWithFallback(
        fileName,
        { loop: true, volume: this._bgmVolume },
        (howl) => {
          this.bgmHowls.set(key as BgmKey, howl)
          // Auto-play if this BGM was pending
          if (this._pendingPhase !== null) {
            const wanted = PHASE_BGM[this._pendingPhase] ?? null
            if (wanted === key && this.currentBgm !== wanted) {
              this.crossfadeTo(wanted as BgmKey)
            }
          }
        },
      )
    }

    for (const [key, fileName] of Object.entries(SFX_NAMES)) {
      this.loadWithFallback(
        fileName,
        { loop: false, volume: this._sfxVolume },
        (howl) => {
          this.sfxHowls.set(key as SfxKey, howl)
        },
      )
    }
  }

  /** Switch BGM based on game phase */
  setPhase(phase: GamePhase): void {
    this._pendingPhase = phase
    if (!this._unlocked) return
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

    if (newHowl) {
      this.currentBgm = target
      newHowl.volume(0)
      newHowl.play()
      newHowl.fade(0, this._bgmVolume, FADE_MS)
    } else {
      // Howl not loaded yet — don't set currentBgm so onSuccess can auto-play later
      if (oldHowl) this.currentBgm = null
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
