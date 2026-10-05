import { audio, useMuted } from '../game/audio'

/** Toggles all synthesized audio. Observes mute state so the glyph stays in sync. */
export function MuteButton() {
  const muted = useMuted()
  return (
    <button
      className={`mute-btn ${muted ? 'muted' : ''}`}
      onClick={() => audio.toggleMute()}
      title={muted ? 'Sound off' : 'Sound on'}
      aria-label={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
    >
      {muted ? 'SOUND ✕' : 'SOUND ◂'}
    </button>
  )
}
