import { useState } from 'react'
import { Terminal } from './components/Terminal'
import { StatusBar } from './components/StatusBar'
import { LoginScreen } from './components/LoginScreen'
import { ActivationScreen } from './components/ActivationScreen'
import { EndScreen } from './components/EndScreen'
import { useGame } from './game/useGame'
import { useViewportHeight } from './useViewportHeight'

export default function App() {
  const game = useGame()
  const [confirmReset, setConfirmReset] = useState(false)
  useViewportHeight()

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
