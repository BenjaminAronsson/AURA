/**
 * AURA — SETTINGS STORE
 * =====================
 * Non-audio player preferences (sound lives in audio.ts). Same singleton +
 * subscribe pattern as the audio engine, persisted to localStorage so choices
 * survive a refresh. Components observe via `useSettings()`.
 */

import { useEffect, useState } from 'react'

const KEY = 'aura.settings'

export type TextSpeed = 'normal' | 'fast' | 'instant'

export interface Settings {
  /** CRT scanlines + flicker overlays. */
  crtEffects: boolean
  /** Calm the animated visuals (also implied by the OS reduce-motion setting). */
  reduceMotion: boolean
  /** Typewriter cadence. */
  textSpeed: TextSpeed
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

function load(): Settings {
  const defaults: Settings = {
    crtEffects: true,
    reduceMotion: prefersReducedMotion(),
    textSpeed: 'normal',
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      crtEffects: typeof parsed.crtEffects === 'boolean' ? parsed.crtEffects : defaults.crtEffects,
      reduceMotion:
        typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : defaults.reduceMotion,
      textSpeed:
        parsed.textSpeed === 'fast' || parsed.textSpeed === 'instant' || parsed.textSpeed === 'normal'
          ? parsed.textSpeed
          : defaults.textSpeed,
    }
  } catch {
    return defaults
  }
}

class SettingsStore {
  private state: Settings = load()
  private listeners = new Set<() => void>()

  get current(): Settings {
    return this.state
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.state = { ...this.state, [key]: value }
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state))
    } catch {
      /* ignore */
    }
    this.listeners.forEach((f) => f())
  }

  /** Typewriter cps multiplier (callers scale their base rate by this). */
  get typeSpeedFactor(): number {
    return this.state.textSpeed === 'fast' ? 2.2 : 1
  }

  get instantText(): boolean {
    return this.state.textSpeed === 'instant'
  }
}

export const settings = new SettingsStore()

/** React hook: re-renders when any setting changes. */
export function useSettings(): Settings {
  const [s, setS] = useState(settings.current)
  useEffect(() => settings.subscribe(() => setS(settings.current)), [])
  return s
}
