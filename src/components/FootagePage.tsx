import { useEffect, useState } from 'react'
import { CAMERAS, FOOTAGE_NOTE } from '../game/portalContent'

/** Camera-OSD timestamp, ticking, Stockholm time. */
function useOsdTime(): string {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const d = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })
  const t = now.toLocaleTimeString('sv-SE', { hour12: false, timeZone: 'Europe/Stockholm' })
  return `${d} ${t}`
}

export function FootagePage() {
  const stamp = useOsdTime()
  return (
    <div className="footage">
      <p className="portal-note">{FOOTAGE_NOTE}</p>
      <div className="footage-grid">
        {CAMERAS.map((cam) => (
          <figure key={cam.id} className={`camera-tile camera-${cam.state}`}>
            <div className="camera-screen">
              {cam.state === 'static' && <div className="camera-noise" aria-hidden="true" />}
              <div className="camera-osd">
                <span className="camera-id">{cam.id}</span>
                <span className="camera-rec" aria-hidden="true">
                  ● REC
                </span>
              </div>
              <div className="camera-center">
                {cam.state === 'lost' ? 'SIGNAL LOST' : 'NO VIDEO'}
                <span className="camera-sub">
                  {cam.state === 'lost' ? 'FEED DISCONNECTED' : 'DECODER OFFLINE'}
                </span>
              </div>
              <div className="camera-stamp">{stamp}</div>
            </div>
            <figcaption className="camera-name">{cam.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
