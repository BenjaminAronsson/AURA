import { useEffect, useState } from 'react'
import { AuraCore } from './AuraCore'
import { PortalNav } from './PortalNav'
import { SurveillanceTag } from './SurveillanceTag'
import { MuteButton } from './MuteButton'
import { CountdownChip } from './CountdownChip'
import { HOME } from '../game/portalContent'
import type { View } from '../App'

interface Props {
  inProgress: boolean
  onEnter: () => void
  onNavigate: (v: View) => void
  /** Live Step-4 deadline, or null. */
  countdownDeadline: number | null
}

/** Stockholm wall-clock, HH:MM:SS, for the authentic "live system" strip. */
function useClock(): string {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now.toLocaleTimeString('sv-SE', { hour12: false, timeZone: 'Europe/Stockholm' })
}

export function HomeScreen({ inProgress, onEnter, onNavigate, countdownDeadline }: Props) {
  const clock = useClock()
  return (
    <div className="screen home">
      <div className="home-inner">
        <div className="home-visual">
          <AuraCore />
        </div>

        <div className="home-brand">
          <span className="home-title">{HOME.title}</span>
          <span className="home-subtitle">{HOME.subtitle}</span>
        </div>

        <div className="home-status" role="status">
          <span className="home-status-item">
            FACILITY <b className="alert">LOCKDOWN</b>
          </span>
          <span className="home-status-item">
            CORE <b className="alert">DORMANT</b>
          </span>
          <span className="home-status-item">
            SURVEILLANCE <b className="alert">ACTIVE</b>
          </span>
          <span className="home-status-item">
            {clock} <span className="home-status-tz">CET</span>
          </span>
        </div>

        <div className="home-controls">
          <SurveillanceTag />
          <MuteButton />
        </div>

        {countdownDeadline !== null && (
          <div className="home-countdown">
            <CountdownChip deadline={countdownDeadline} />
          </div>
        )}

        <p className="home-tagline">{HOME.tagline}</p>

        <PortalNav
          active="home"
          variant="home"
          inProgress={inProgress}
          onEnter={onEnter}
          onNavigate={onNavigate}
        />

        <p className="home-foot">{HOME.lastSession}</p>
      </div>
    </div>
  )
}
