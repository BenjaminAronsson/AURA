import { useEffect, useState } from 'react'
import { Terminal } from './components/Terminal'
import { StatusBar } from './components/StatusBar'
import { TransferMonitor } from './components/TransferMonitor'
import { LoginScreen } from './components/LoginScreen'
import { ActivationScreen } from './components/ActivationScreen'
import { EndScreen } from './components/EndScreen'
import { MuteButton } from './components/MuteButton'
import { SurveillanceTag } from './components/SurveillanceTag'
import { HomeScreen } from './components/HomeScreen'
import { PortalLayout } from './components/PortalLayout'
import { FootagePage } from './components/FootagePage'
import { EmailsPage } from './components/EmailsPage'
import { FaqPage } from './components/FaqPage'
import { IncidentsPage } from './components/IncidentsPage'
import { SettingsPage } from './components/SettingsPage'
import { useGame } from './game/useGame'
import { audio } from './game/audio'
import { useSettings } from './game/settings'
import { useViewportHeight } from './useViewportHeight'

export type View = 'home' | 'footage' | 'emails' | 'faq' | 'incidents' | 'settings' | 'game'

export default function App() {
  const game = useGame()
  // The portal view sits above the game's own phase machine. useGame() stays
  // mounted, so leaving the game to browse the portal never loses progress.
  const [view, setView] = useState<View>(() =>
    game.phase === 'terminal' || game.phase === 'won' ? 'game' : 'home',
  )
  const [confirmReset, setConfirmReset] = useState(false)
  const s = useSettings()
  useViewportHeight()

  // Soundtrack bed plays across the whole session (home + game), stopping only at
  // the victory screen. Intent-based so a first gesture starts it.
  useEffect(() => {
    audio.setAmbient(game.phase !== 'won')
  }, [game.phase])

  // Step-4 transfer alarm runs while the clock is live (even if the player has
  // popped out to the portal — the pressure keeps going).
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

  // Phones only allow audio after a user gesture, and iOS only counts certain
  // events. Unlock on ANY tap/click/key anywhere (capture phase, so it runs even
  // if a component stops propagation). unlock() is cheap once audio is running.
  useEffect(() => {
    const unlock = () => audio.unlock()
    const events = ['touchend', 'click', 'keydown', 'pointerup'] as const
    events.forEach((e) => document.addEventListener(e, unlock, { capture: true, passive: true }))
    return () => events.forEach((e) => document.removeEventListener(e, unlock, { capture: true }))
  }, [])

  const inProgress = game.phase === 'terminal' || game.phase === 'activating'
  // Live transfer deadline, shown as a chip in the portal so time isn't lost while browsing.
  const activeDeadline = game.phase === 'terminal' ? game.countdownDeadline : null

  function navigate(v: View) {
    audio.unlock()
    audio.uiBlip()
    setView(v)
  }

  /** MENU from any game stage: go to the portal, keeping all progress. */
  function leaveToMenu() {
    // Leaving mid-activation would otherwise replay the whole sequence on return;
    // finish it so RESUME lands straight in the terminal.
    if (game.phase === 'activating') game.finishActivation()
    navigate('home')
  }

  function enterGame() {
    audio.unlock()
    setView('game')
  }

  function handleReset() {
    if (confirmReset) {
      game.reset()
      setConfirmReset(false)
      setView('home')
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 4000)
    }
  }

  function fullReset() {
    game.reset()
    setView('home')
  }

  const portalProps = {
    active: view,
    inProgress,
    onNavigate: navigate,
    onEnter: enterGame,
    countdownDeadline: activeDeadline,
  }

  return (
    <div className="app">
      {s.crtEffects && (
        <>
          <div className="scanlines" aria-hidden="true" />
          {!s.reduceMotion && <div className="flicker" aria-hidden="true" />}
        </>
      )}

      {view === 'home' && (
        <HomeScreen
          inProgress={inProgress}
          onEnter={enterGame}
          onNavigate={navigate}
          countdownDeadline={activeDeadline}
        />
      )}

      {view === 'footage' && (
        <PortalLayout title="SECURITY FOOTAGE" {...portalProps}>
          <FootagePage />
        </PortalLayout>
      )}
      {view === 'emails' && (
        <PortalLayout title="MAIL RELAY" {...portalProps}>
          <EmailsPage />
        </PortalLayout>
      )}
      {view === 'faq' && (
        <PortalLayout title="FAQ" {...portalProps}>
          <FaqPage />
        </PortalLayout>
      )}
      {view === 'incidents' && (
        <PortalLayout title="INCIDENT REPORTS" {...portalProps}>
          <IncidentsPage />
        </PortalLayout>
      )}
      {view === 'settings' && (
        <PortalLayout title="SETTINGS" {...portalProps}>
          <SettingsPage onReset={fullReset} />
        </PortalLayout>
      )}

      {view === 'game' && (
        <>
          {/* MENU + sound on every non-terminal stage too (the terminal has its own topbar). */}
          {game.phase !== 'terminal' && (
            <div className="game-bar">
              <button className="nav-btn" onClick={leaveToMenu} title="Back to menu — progress is kept">
                ◂ MENU
              </button>
              <SurveillanceTag />
              <MuteButton />
            </div>
          )}

          {game.phase === 'login' && <LoginScreen onAuthenticate={game.login} />}

          {game.phase === 'activating' && (
            <ActivationScreen operatorId={game.operatorId} onDone={game.finishActivation} />
          )}

          {game.phase === 'won' && <EndScreen operatorId={game.operatorId} onReset={fullReset} />}

          {game.phase === 'terminal' && (
            <div className="screen terminal-screen">
              <header className="topbar">
                <span className="brand">AURA</span>
                <span className="brand-sub">ADAPTIVE UNIFIED RESPONSE ARCHITECTURE</span>
                <SurveillanceTag />
                {/* Actions wrap to their own full-width row on phones (see .topbar-actions). */}
                <div className="topbar-actions">
                  <button className="nav-btn" onClick={leaveToMenu} title="Back to menu — progress is kept">
                    ◂ MENU
                  </button>
                  <MuteButton />
                  <button
                    className={`reset-btn ${confirmReset ? 'armed' : ''}`}
                    onClick={handleReset}
                    title="Reset session"
                  >
                    {confirmReset ? 'CONFIRM?' : 'RESET'}
                  </button>
                </div>
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
        </>
      )}
    </div>
  )
}
