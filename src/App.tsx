import { useEffect, useState } from 'react'
import { Terminal } from './components/Terminal'
import { StatusBar } from './components/StatusBar'
import { TransferMonitor } from './components/TransferMonitor'
import { LoginScreen } from './components/LoginScreen'
import { ActivationScreen } from './components/ActivationScreen'
import { EndScreen } from './components/EndScreen'
import { MuteButton } from './components/MuteButton'
import { useGame } from './game/useGame'
import { audio } from './game/audio'
import { useViewportHeight } from './useViewportHeight'

export default function App() {
  const game = useGame()
  const [confirmReset, setConfirmReset] = useState(false)
  useViewportHeight()

  // Soundtrack bed plays across the whole session (from the login screen on),
  // stopping only at the victory screen. Declared as intent so a first gesture
  // (login focus/typing) starts it — the AudioContext can't exist before then.
  useEffect(() => {
    audio.setAmbient(game.phase !== 'won')
  }, [game.phase])

  // Step-4 transfer alarm (accelerates toward 00:00) runs while the clock is live.
  useEffect(() => {
    const active = game.phase === 'terminal' && game.countdownDeadline !== null
    audio.setTransfer(
      active ? { deadline: game.countdownDeadline!, durationMs: game.countdownDurationMs } : null,
    )
  }, [game.phase, game.countdownDeadline, game.countdownDurationMs])

  // Victory sting.
  useEffect(() => {
    if (game.phase === 'won') audio.win()
  }, [game.phase])

  function handleReset() {
    if (confirmReset) {
      game.reset()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 4000)
    }
  }

  return (
    <div className="app">
      <div className="scanlines" aria-hidden="true" />
      <div className="flicker" aria-hidden="true" />

      {game.phase === 'login' && <LoginScreen onAuthenticate={game.login} />}

      {game.phase === 'activating' && (
        <ActivationScreen operatorId={game.operatorId} onDone={game.finishActivation} />
      )}

      {game.phase === 'won' && <EndScreen operatorId={game.operatorId} onReset={game.reset} />}

      {game.phase === 'terminal' && (
        <div className="screen terminal-screen">
          <header className="topbar">
            <span className="brand">AURA</span>
            <span className="brand-sub">ADAPTIVE UNIFIED RESPONSE ARCHITECTURE</span>
            <MuteButton />
            <button className="reset-btn" onClick={handleReset} title="Reset session">
              {confirmReset ? 'CONFIRM RESET' : 'RESET'}
            </button>
          </header>

          <StatusBar
            accessLevel={game.accessLevel}
            module={game.activeModule}
            complete={game.complete}
            progress={game.progress}
          />

          {game.countdownDeadline !== null && (
            <TransferMonitor
              deadline={game.countdownDeadline}
              durationMs={game.countdownDurationMs}
            />
          )}

          <Terminal
            log={game.log}
            onSubmit={game.submit}
            disabled={game.complete}
            typeFromStart={game.freshTerminal}
          />
        </div>
      )}
    </div>
  )
}
