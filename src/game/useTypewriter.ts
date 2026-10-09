/**
 * useTypewriter — reveals a growing list of lines one character at a time,
 * like a security terminal printing to screen in a film.
 *
 * - Lines present at mount are shown instantly when `typeFromStart` is false
 *   (used when restoring a saved session — no re-typing of history).
 * - Any line appended after mount is typed out, in order.
 * - `skip()` instantly reveals everything currently queued (click-to-skip).
 */

import { useCallback, useEffect, useState } from 'react'
import { audio } from './audio'
import { settings } from './settings'

export interface TypeableLine {
  kind: string
  text: string
}

interface Options {
  /** Type the initial lines too (fresh entry) vs. show them instantly (restore). */
  typeFromStart?: boolean
  /** Characters per second. */
  cps?: number
}

export function useTypewriter<T extends TypeableLine>(lines: T[], opts: Options = {}) {
  const cps = opts.cps ?? 55
  // Snapshot how many lines existed at mount so restores don't re-type.
  const [revealed, setRevealed] = useState(() => (opts.typeFromStart ? 0 : lines.length))
  const [partial, setPartial] = useState<string | null>(null)

  useEffect(() => {
    if (revealed >= lines.length) {
      setPartial(null)
      return
    }
    // Instant text speed (a settings option) reveals everything without typing.
    if (settings.instantText) {
      setPartial(null)
      setRevealed(lines.length)
      return
    }
    const full = lines[revealed]?.text ?? ''

    // Blank lines reveal instantly.
    if (full.length === 0) {
      setPartial(null)
      setRevealed((r) => r + 1)
      return
    }

    const base = 1000 / (cps * settings.typeSpeedFactor)
    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      i += 1
      setPartial(full.slice(0, i))
      // Teletype tick as characters print. Throttled + skips spaces so it reads
      // as a steady printer chatter rather than a continuous tone.
      const typed = full[i - 1]
      if (typed && typed !== ' ' && i % 2 === 0) audio.type()
      if (i >= full.length) {
        // Brief pause at end of line, then commit and move on.
        timer = setTimeout(() => {
          setPartial(null)
          setRevealed((r) => r + 1)
        }, 140)
      } else {
        // Jitter + a longer beat after sentence punctuation for a human cadence.
        const ch = full[i - 1]
        const extra = /[.,;:?!]/.test(ch) ? base * 6 : base * Math.random()
        timer = setTimeout(tick, base + extra)
      }
    }

    setPartial('')
    timer = setTimeout(tick, base)
    return () => clearTimeout(timer)
  }, [revealed, lines, cps])

  const skip = useCallback(() => {
    setRevealed(lines.length)
    setPartial(null)
  }, [lines.length])

  const display: T[] = []
  const limit = Math.min(revealed, lines.length)
  for (let i = 0; i < limit; i++) display.push(lines[i])
  if (partial !== null && revealed < lines.length) {
    display.push({ ...lines[revealed], text: partial })
  }

  return { display, typing: revealed < lines.length, skip }
}
