import { useEffect, useRef } from 'react'
import { useTypewriter, type TypeableLine } from '../game/useTypewriter'

interface Props {
  lines: TypeableLine[]
  cps?: number
  /** Fired once, `holdMs` after the last character is typed. */
  onDone?: () => void
  holdMs?: number
  className?: string
  showCursor?: boolean
}

/** Types a fixed sequence of lines once (login intro, activation sequence). */
export function TypedBlock({ lines, cps, onDone, holdMs = 0, className, showCursor = true }: Props) {
  const { display, typing, skip } = useTypewriter(lines, { typeFromStart: true, cps })
  const fired = useRef(false)

  useEffect(() => {
    if (!typing && !fired.current) {
      fired.current = true
      const t = setTimeout(() => onDone?.(), holdMs)
      return () => clearTimeout(t)
    }
  }, [typing, onDone, holdMs])

  return (
    <div className={className} onClick={skip}>
      {display.map((l, i) => (
        <div key={i} className={`line line-${l.kind}`}>
          {l.text === '' ? ' ' : l.text}
          {showCursor && typing && i === display.length - 1 && <span className="cursor" />}
        </div>
      ))}
    </div>
  )
}
