import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTypewriter } from '../game/useTypewriter'
import type { LogLine } from '../game/useGame'

interface TerminalProps {
  log: LogLine[]
  onSubmit: (input: string) => void
  disabled?: boolean
  /** Type the opening log out live (fresh entry) vs. show instantly (restore). */
  typeFromStart?: boolean
}

export function Terminal({ log, onSubmit, disabled, typeFromStart }: TerminalProps) {
  const { display, typing, skip } = useTypewriter(log, { typeFromStart, cps: 70 })
  const [value, setValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const locked = Boolean(disabled) || typing

  // Auto-scroll to newest output as it types.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [display])

  // Reclaim focus whenever input unlocks.
  useEffect(() => {
    if (!locked) inputRef.current?.focus()
  }, [locked])

  function send() {
    if (locked) return
    const v = value
    setValue('')
    onSubmit(v)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  function handleAreaClick() {
    if (typing) skip()
    else inputRef.current?.focus()
  }

  const placeholder = disabled ? 'SESSION TERMINATED' : typing ? '' : 'ENTER RESPONSE'

  return (
    <div className="terminal" onClick={handleAreaClick}>
      <div className="terminal-log" ref={scrollRef}>
        {display.map((line, i) => (
          <div key={i} className={`line line-${line.kind}`}>
            {line.text === '' ? ' ' : line.text}
            {typing && i === display.length - 1 && <span className="cursor" />}
          </div>
        ))}
      </div>
      <form className="terminal-input" onSubmit={(e) => { e.preventDefault(); send() }}>
        <span className="prompt-glyph">{disabled ? '×' : typing ? '…' : '>'}</span>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          disabled={locked}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="terminal input"
        />
      </form>
    </div>
  )
}
