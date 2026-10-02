import { useMemo, useState } from 'react'
import { TypedBlock } from './TypedBlock'
import { buildEndingLines, END_BANNER } from '../game/content'

interface Props {
  operatorId: string
  onReset: () => void
}

/** Victory page: types the shutdown sequence, then declares the breach secured. */
export function EndScreen({ operatorId, onReset }: Props) {
  const [revealed, setRevealed] = useState(false)
  const lines = useMemo(
    () => buildEndingLines(operatorId).map((text) => ({ kind: 'success', text })),
    [operatorId],
  )

  return (
    <div className="screen end">
      <div className="end-inner">
        <TypedBlock lines={lines} cps={52} holdMs={500} onDone={() => setRevealed(true)} />

        <div className={`end-banner ${revealed ? 'show' : ''}`}>
          <div className="end-title">{END_BANNER.title}</div>
          <div className="end-status">{END_BANNER.status}</div>
          <div className="end-sub-group">
            {END_BANNER.lines.map((l) => (
              <div key={l} className="end-sub">{l}</div>
            ))}
          </div>
          <div className="end-won">{END_BANNER.won}</div>
          <button className="login-btn end-btn" onClick={onReset}>
            {END_BANNER.again}
          </button>
        </div>
      </div>
    </div>
  )
}
