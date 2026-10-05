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
const MASTER_VOLUME = 0.5

type Ctx = AudioContext

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

class AuraAudio {
  private ctx: Ctx | null = null
  private master: GainNode | null = null
  private muted = loadMuted()
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
      this.master.gain.value = this.muted ? 0 : MASTER_VOLUME
      this.master.connect(this.ctx.destination)
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
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, this.ctx.currentTime, 0.02)
    }
    this.emit()
  }

  toggleMute(): void {
    this.unlock()
    this.setMuted(!this.muted)
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

  /**
   * "Access granted" confirmation — deliberately neutral/procedural, not a happy
   * melody: two clipped equal-pitch beeps plus a low mechanical latch thud.
   */
  success(): void {
    this.tone({ freq: 784, type: 'square', dur: 0.055, gain: 0.12, filter: 2400 })
    this.tone({ freq: 784, type: 'square', dur: 0.075, gain: 0.12, filter: 2400, when: 0.1 })
    this.tone({ freq: 130, type: 'sine', dur: 0.16, gain: 0.13, when: 0.1 })
  }

  error(): void {
    this.tone({ freq: 240, type: 'sawtooth', dur: 0.32, gain: 0.2, slideTo: 90, filter: 900 })
  }

  boot(): void {
    this.tone({ freq: 55, type: 'sine', dur: 0.7, gain: 0.3, slideTo: 165, filter: 500 })
    this.tone({ freq: 440, type: 'triangle', dur: 0.12, gain: 0.1, when: 0.55 })
  }

  activation(): void {
    this.tone({ freq: 160, type: 'sawtooth', dur: 0.9, gain: 0.14, slideTo: 760, filter: 1200 })
    this.tone({ freq: 523.25, type: 'triangle', dur: 0.14, gain: 0.12, when: 0.8 })
  }

  win(): void {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', dur: 0.4, gain: 0.18, when: i * 0.12 }),
    )
    // Final held chord.
    ;[523.25, 659.25, 783.99].forEach((f) =>
      this.tone({ freq: f, type: 'triangle', dur: 0.9, gain: 0.1, when: 0.5 }),
    )
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
