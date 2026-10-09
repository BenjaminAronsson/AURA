/**
 * AURA — AUDIO ENGINE (Web Audio, fully synthesized)
 * ==================================================
 * All sound is generated procedurally — no asset files, works offline on
 * GitHub Pages, no copyright concerns. Covers terminal UI blips, the
 * login/activation/win stings, an ambient "soundtrack" bed, and the Step-4
 * transfer alarm that accelerates toward 00:00.
 *
 * The AudioContext is created lazily on the first user gesture (`unlock()`),
 * since browsers block audio before interaction. Mute state persists to
 * localStorage; components observe it via `useMuted()`.
 */

import { useEffect, useState } from 'react'

const MUTE_KEY = 'aura.muted'
const VOLUME_KEY = 'aura.volume'
const DEFAULT_VOLUME = 0.5

type Ctx = AudioContext

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function loadVolume(): number {
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? '')
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

class AuraAudio {
  private ctx: Ctx | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private analyserBuf: Uint8Array<ArrayBuffer> | null = null
  private muted = loadMuted()
  private volume = loadVolume()
  private listeners = new Set<() => void>()

  // Long-lived nodes for the ambient bed, plus the intent flag so a gesture
  // after a page-restore can start it even though the first attempt was locked.
  private ambient: { gain: GainNode; stop: () => void } | null = null
  private wantAmbient = false
  // Self-scheduling transfer alarm, plus its pending params for the same reason.
  private transferTimer: number | null = null
  private transferParams: { deadline: number; durationMs: number } | null = null

  get isMuted(): boolean {
    return this.muted
  }

  get volumeLevel(): number {
    return this.volume
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit() {
    this.listeners.forEach((f) => f())
  }

  /** Create/resume the context. Must be called from within a user gesture. */
  unlock(): void {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : this.volume
      // Analyser taps the master (pass-through) so the home visual can react to sound.
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 256
      this.analyserBuf = new Uint8Array(new ArrayBuffer(this.analyser.fftSize))
      this.master.connect(this.analyser)
      this.analyser.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    // Realize any long-lived sound that was requested while still locked.
    if (this.wantAmbient && !this.ambient) this.startAmbient()
    if (this.transferParams && this.transferTimer === null) {
      this.startTransfer(this.transferParams.deadline, this.transferParams.durationMs)
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      /* ignore */
    }
    this.applyMasterGain()
    this.emit()
  }

  toggleMute(): void {
    this.unlock()
    this.setMuted(!this.muted)
  }

  setVolume(v: number): void {
    this.volume = Math.min(1, Math.max(0, v))
    try {
      localStorage.setItem(VOLUME_KEY, String(this.volume))
    } catch {
      /* ignore */
    }
    this.applyMasterGain()
    this.emit()
  }

  private applyMasterGain(): void {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02)
    }
  }

  /** Current output level (0..~1), for the home visual. 0 when locked/silent. */
  getLevel(): number {
    const a = this.analyser
    const buf = this.analyserBuf
    if (!a || !buf) return 0
    a.getByteTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) {
      const x = (buf[i] - 128) / 128
      sum += x * x
    }
    return Math.min(1, Math.sqrt(sum / buf.length) * 3)
  }

  /* ---- low-level tone helper ------------------------------------- */

  private tone(opts: {
    freq: number
    type?: OscillatorType
    dur: number
    gain?: number
    when?: number
    slideTo?: number
    filter?: number
  }): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const t0 = ctx.currentTime + (opts.when ?? 0)
    const osc = ctx.createOscillator()
    osc.type = opts.type ?? 'square'
    osc.frequency.setValueAtTime(opts.freq, t0)
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + opts.dur)

    const g = ctx.createGain()
    const peak = opts.gain ?? 0.2
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)

    let tail: AudioNode = g
    if (opts.filter) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = opts.filter
      g.connect(lp)
      tail = lp
    }
    osc.connect(g)
    tail.connect(master)
    osc.start(t0)
    osc.stop(t0 + opts.dur + 0.05)
  }

  /* ---- UI sound effects ------------------------------------------ */

  keyTick(): void {
    this.tone({ freq: 1600 + Math.random() * 300, type: 'square', dur: 0.025, gain: 0.025 })
  }

  /** Soft teletype tick while AURA is printing text to screen. Kept very quiet. */
  type(): void {
    this.tone({ freq: 1250 + Math.random() * 400, type: 'square', dur: 0.012, gain: 0.014 })
  }

  submit(): void {
    this.tone({ freq: 880, type: 'square', dur: 0.05, gain: 0.12 })
    this.tone({ freq: 1320, type: 'square', dur: 0.06, gain: 0.1, when: 0.05 })
  }

  /** Quiet security-flavored blip for portal navigation. */
  uiBlip(): void {
    this.tone({ freq: 430, type: 'sine', dur: 0.05, gain: 0.06, filter: 1400 })
    this.tone({ freq: 215, type: 'sine', dur: 0.1, gain: 0.05, when: 0.02 })
  }

  /**
   * "Accepted" confirmation — cold and procedural, not a chime: a low filtered
   * tone with a sub thump and a faint detuned shimmer that decays. No melodic
   * interval, a touch of unease rather than a reward jingle.
   */
  success(): void {
    this.tone({ freq: 196, type: 'sawtooth', dur: 0.26, gain: 0.14, filter: 760 })
    this.tone({ freq: 294, type: 'sawtooth', dur: 0.22, gain: 0.07, filter: 900, when: 0.01 })
    this.tone({ freq: 65, type: 'sine', dur: 0.3, gain: 0.16 })
    this.tone({ freq: 1570, type: 'sine', dur: 0.12, gain: 0.03, when: 0.04 })
  }

  error(): void {
    this.tone({ freq: 240, type: 'sawtooth', dur: 0.32, gain: 0.2, slideTo: 90, filter: 900 })
  }

  boot(): void {
    // ACCESS GRANTED — a restrained, authoritative two-tone that steps DOWN (a
    // latch engaging), over a short sub underlay. Procedural and dark, not a sweep.
    this.tone({ freq: 196, type: 'sawtooth', dur: 0.16, gain: 0.1, filter: 620 })
    this.tone({ freq: 131, type: 'sawtooth', dur: 0.34, gain: 0.12, filter: 560, when: 0.15 })
    this.tone({ freq: 55, type: 'sine', dur: 0.55, gain: 0.18, slideTo: 44, when: 0.14 })
  }

  activation(): void {
    // Low saw sweeping up through a lowpass + a deep thud — a system coming under load,
    // not a cheerful chime.
    this.tone({ freq: 90, type: 'sawtooth', dur: 1.1, gain: 0.16, slideTo: 440, filter: 820 })
    this.tone({ freq: 48, type: 'sine', dur: 0.5, gain: 0.2, slideTo: 60 })
    this.tone({ freq: 196, type: 'sawtooth', dur: 0.16, gain: 0.08, filter: 600, when: 0.95 })
  }

  win(): void {
    // Ominous and final, not a fanfare: a deep sub that falls away, a dark low
    // minor dyad held underneath, and one distant high shimmer that fades — relief
    // tinged with dread, matching the "the money never left, but what is AURA?" tone.
    this.tone({ freq: 58, type: 'sine', dur: 2.4, gain: 0.26, slideTo: 40, filter: 320 })
    this.tone({ freq: 110, type: 'sawtooth', dur: 1.9, gain: 0.09, slideTo: 80, filter: 340 })
    // Low minor third (D3 + F3), dark and unresolved.
    this.tone({ freq: 146.83, type: 'triangle', dur: 1.8, gain: 0.08, when: 0.18, filter: 480 })
    this.tone({ freq: 174.61, type: 'triangle', dur: 1.8, gain: 0.07, when: 0.18, filter: 480 })
    // A single far-off shimmer for mystery.
    this.tone({ freq: 932, type: 'sine', dur: 0.7, gain: 0.03, when: 0.06 })
  }

  /* ---- ambient "soundtrack" bed ---------------------------------- */

  /** Declare whether the ambient bed should be playing (gesture-safe). */
  setAmbient(on: boolean): void {
    this.wantAmbient = on
    if (on) this.startAmbient()
    else this.stopAmbient()
  }

  private startAmbient(): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master || this.ambient) return

    const gain = ctx.createGain()
    gain.gain.value = 0.0001
    gain.gain.setTargetAtTime(0.09, ctx.currentTime, 1.5)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 380
    lp.connect(gain)
    gain.connect(master)

    // Two detuned low drones.
    const oscs = [55, 82.5].map((freq, i) => {
      const o = ctx.createOscillator()
      o.type = i === 0 ? 'sawtooth' : 'triangle'
      o.frequency.value = freq
      o.detune.value = i === 0 ? -6 : 7
      o.connect(lp)
      o.start()
      return o
    })

    // Slow filter sweep LFO for movement.
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 140
    lfo.connect(lfoGain)
    lfoGain.connect(lp.frequency)
    lfo.start()

    this.ambient = {
      gain,
      stop: () => {
        oscs.forEach((o) => {
          try {
            o.stop()
          } catch {
            /* already stopped */
          }
        })
        try {
          lfo.stop()
        } catch {
          /* already stopped */
        }
      },
    }
  }

  private stopAmbient(): void {
    const ctx = this.ctx
    if (!this.ambient || !ctx) return
    const { gain, stop } = this.ambient
    this.ambient = null
    gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4)
    window.setTimeout(stop, 1200)
  }

  /* ---- Step-4 transfer alarm (accelerating) ---------------------- */

  /** Declare the transfer alarm's params, or null to stop it (gesture-safe). */
  setTransfer(params: { deadline: number; durationMs: number } | null): void {
    this.transferParams = params
    if (params) this.startTransfer(params.deadline, params.durationMs)
    else this.stopTransfer()
  }

  private startTransfer(deadline: number, durationMs: number): void {
    if (this.transferTimer !== null || !this.ctx) return

    const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
    const start = deadline - durationMs

    const beat = () => {
      const p = clamp01((Date.now() - start) / durationMs)
      // Alarm pitch, loudness and tempo all rise with elapsed progress.
      const freq = 440 + p * 760
      const gain = 0.09 + p * 0.17
      // Main alarm tone + a slightly detuned partner → an unsettling dissonant beat.
      this.tone({ freq, type: 'square', dur: 0.1, gain })
      this.tone({ freq: freq * 1.06, type: 'square', dur: 0.1, gain: gain * 0.7 })
      // Sub-bass thump for weight and dread.
      this.tone({ freq: 58 + p * 34, type: 'sine', dur: 0.17, gain: 0.12 + p * 0.12 })
      // Late in the countdown, add an urgent second hit for a double-pulse.
      if (p > 0.55) {
        this.tone({ freq: freq * 1.5, type: 'square', dur: 0.06, gain: gain * 0.5, when: 0.09 })
      }
      // Interval shrinks from ~1.1s down to ~0.16s as the clock nears zero.
      const interval = 1100 - p * 940
      this.transferTimer = window.setTimeout(beat, interval)
    }
    beat()
  }

  private stopTransfer(): void {
    if (this.transferTimer !== null) {
      window.clearTimeout(this.transferTimer)
      this.transferTimer = null
    }
  }

  /** Stop every long-lived sound (used on reset). */
  stopAll(): void {
    this.setTransfer(null)
    this.setAmbient(false)
  }
}

export const audio = new AuraAudio()

/** React hook: re-renders a control when the mute state changes. */
export function useMuted(): boolean {
  const [muted, setMuted] = useState(audio.isMuted)
  useEffect(() => audio.subscribe(() => setMuted(audio.isMuted)), [])
  return muted
}

/** React hook: re-renders a control when mute/volume change. */
export function useVolume(): number {
  const [vol, setVol] = useState(audio.volumeLevel)
  useEffect(() => audio.subscribe(() => setVol(audio.volumeLevel)), [])
  return vol
}
