import { useEffect, useState } from 'react'
import { AuraCore } from './AuraCore'
import { PortalNav } from './PortalNav'
import { HOME } from '../game/portalContent'
import type { View } from '../App'

interface Props {
  inProgress: boolean
  onEnter: () => void
  onNavigate: (v: View) => void
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

export function HomeScreen({ inProgress, onEnter, onNavigate }: Props) {
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
            {clock} <span className="home-status-tz">CET</span>
          </span>
        </div>

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
