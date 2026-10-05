import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../game/content'

interface TransferMonitorProps {
  /** Absolute epoch-ms deadline (00:00 of the countdown). */
  deadline: number
  /** Total configured countdown duration, in ms. */
  durationMs: number
}

/** Swedish-style grouping: 1 240 880 → "1 240 880". */
function groupThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** MM:SS, prefixing "-" once the clock runs past zero. */
function clock(seconds: number): string {
  const sign = seconds < 0 ? '-' : ''
  const abs = Math.abs(seconds)
  const m = Math.floor(abs / 60)
  const s = abs % 60
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/**
 * Step-4 drama: an accelerating "transfer progress" bar and a set of corporate
 * accounts visibly draining toward zero as the countdown approaches 00:00.
 * Self-animates with requestAnimationFrame so the rest of the app doesn't
 * re-render. Visual pressure only — passing 00:00 doesn't block the override,
 * and the balances are decoys (see CONFIG.transfer).
 */
export function TransferMonitor({ deadline, durationMs }: TransferMonitorProps) {
  const [now, setNow] = useState(() => Date.now())
  const raf = useRef(0)

  useEffect(() => {
    const tick = () => {
      setNow(Date.now())
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const start = deadline - durationMs
  const elapsedFrac = clamp01((now - start) / durationMs)
  // Accelerating curve: slow at first, rushing toward 100% near 00:00.
  const progress = clamp01(Math.pow(elapsedFrac, CONFIG.transfer.curveExponent))
  const pct = progress * 100
  const remainingSec = Math.round((deadline - now) / 1000)
  const expired = remainingSec < 0

  return (
    <div className={`transfer ${expired ? 'expired' : ''}`} role="alert" aria-live="off">
      <div className="transfer-head">
        <span className="transfer-danger" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="danger-tri">
            <path d="M12 2 L23 21 H1 Z" />
            <rect x="11" y="9" width="2" height="6" />
            <rect x="11" y="17" width="2" height="2" />
          </svg>
        </span>
        <span className="transfer-title">UNAUTHORIZED TRANSFER IN PROGRESS</span>
        <span className="transfer-clock">{clock(remainingSec)}</span>
      </div>

      <div className="transfer-bar" aria-hidden="true">
        <div className="transfer-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="transfer-meta">
        <span>TRANSFER PROGRESS</span>
        <span>{pct.toFixed(1)}%</span>
      </div>

      <div className="transfer-accounts">
        <div className="transfer-accounts-label">CORPORATE ACCOUNTS — DRAINING</div>
        {CONFIG.transfer.accounts.map((acct) => {
          const remaining = acct.balance * (1 - progress)
          const drained = remaining <= 0.5
          return (
            <div key={acct.label} className={`transfer-acct ${drained ? 'drained' : ''}`}>
              <span className="transfer-acct-id">{acct.label}</span>
              <span className="transfer-acct-bal">
                {groupThousands(Math.max(0, remaining))} SEK
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
