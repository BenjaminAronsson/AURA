import { useState } from 'react'
import { audio, useMuted, useVolume } from '../game/audio'
import { settings, useSettings, type TextSpeed } from '../game/settings'

interface Props {
  /** Clears the saved session and returns to the portal home. */
  onReset: () => void
}

const SPEEDS: { id: TextSpeed; label: string }[] = [
  { id: 'normal', label: 'NORMAL' },
  { id: 'fast', label: 'FAST' },
  { id: 'instant', label: 'INSTANT' },
]

export function SettingsPage({ onReset }: Props) {
  const muted = useMuted()
  const volume = useVolume()
  const s = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="settings">
      <section className="settings-group">
        <h3 className="settings-h">SOUND</h3>

        <div className="settings-row">
          <span className="settings-label">Audio</span>
          <button
            className={`toggle ${muted ? '' : 'on'}`}
            onClick={() => audio.toggleMute()}
            role="switch"
            aria-checked={!muted}
          >
            {muted ? 'OFF' : 'ON'}
          </button>
        </div>

        <div className="settings-row">
          <span className="settings-label">Volume</span>
          <input
            className="settings-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            disabled={muted}
            onChange={(e) => {
              audio.unlock()
              audio.setVolume(parseFloat(e.target.value))
            }}
            onMouseUp={() => audio.uiBlip()}
            aria-label="Volume"
          />
          <span className="settings-value">{Math.round(volume * 100)}%</span>
        </div>
      </section>

      <section className="settings-group">
        <h3 className="settings-h">DISPLAY</h3>

        <div className="settings-row">
          <span className="settings-label">
            CRT effects
            <span className="settings-hint">scanlines &amp; flicker</span>
          </span>
          <button
            className={`toggle ${s.crtEffects ? 'on' : ''}`}
            onClick={() => settings.set('crtEffects', !s.crtEffects)}
            role="switch"
            aria-checked={s.crtEffects}
          >
            {s.crtEffects ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="settings-row">
          <span className="settings-label">
            Reduce motion
            <span className="settings-hint">calms animations</span>
          </span>
          <button
            className={`toggle ${s.reduceMotion ? 'on' : ''}`}
            onClick={() => settings.set('reduceMotion', !s.reduceMotion)}
            role="switch"
            aria-checked={s.reduceMotion}
          >
            {s.reduceMotion ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="settings-row">
          <span className="settings-label">Text speed</span>
          <div className="settings-seg">
            {SPEEDS.map((sp) => (
              <button
                key={sp.id}
                className={`seg ${s.textSpeed === sp.id ? 'active' : ''}`}
                onClick={() => settings.set('textSpeed', sp.id)}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-group">
        <h3 className="settings-h">SESSION</h3>
        <div className="settings-row">
          <span className="settings-label">
            Reset progress
            <span className="settings-hint">clears this team’s saved session</span>
          </span>
          <button
            className={`settings-danger ${confirmReset ? 'armed' : ''}`}
            onClick={() => {
              if (confirmReset) onReset()
              else {
                setConfirmReset(true)
                window.setTimeout(() => setConfirmReset(false), 4000)
              }
            }}
          >
            {confirmReset ? 'CONFIRM RESET' : 'RESET'}
          </button>
        </div>
      </section>
    </div>
  )
}
