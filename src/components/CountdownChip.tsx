import { useEffect, useState } from 'react'
import { formatClock } from './TransferMonitor'

/**
 * Compact transfer countdown shown in the portal (home + content pages) while
 * Step 4 is live, so players can browse footage/emails without losing track of
 * time. Self-ticking; keeps counting into negative time like the main monitor.
 */
export function CountdownChip({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const seconds = Math.round((deadline - now) / 1000)
  return (
    <span className={`cd-chip ${seconds < 0 ? 'expired' : ''}`} role="timer" aria-label="Transfer countdown">
      <span aria-hidden="true">⚠</span> TRANSFER {formatClock(seconds)}
    </span>
  )
}
