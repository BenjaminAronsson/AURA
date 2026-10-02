import { useState, type FormEvent } from 'react'
import { TypedBlock } from './TypedBlock'
import { LOGIN } from '../game/content'

interface Props {
  /** Returns true on valid credentials (parent then switches screens). */
  onAuthenticate: (operator: string, code: string) => boolean
}

type Status = 'idle' | 'working' | 'denied'

export function LoginScreen({ onAuthenticate }: Props) {
  const [operator, setOperator] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [introDone, setIntroDone] = useState(false)

  const introLines = LOGIN.intro.map((text, i) => ({
    kind: i < 2 ? 'aura' : i >= LOGIN.intro.length - 2 ? 'aura' : 'system',
    text,
  }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'working') return
    if (!operator.trim() || !code.trim()) {
      setStatus('denied')
      return
    }
    setStatus('working')
    // Brief cinematic "verifying" beat before the verdict.
    window.setTimeout(() => {
      const ok = onAuthenticate(operator, code)
      if (!ok) setStatus('denied')
      // On success, the parent unmounts this screen.
    }, 850)
  }

  return (
    <div className="screen login">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand">AURA</span>
        </div>

        <TypedBlock
          className="login-intro"
          lines={introLines}
          cps={60}
          onDone={() => setIntroDone(true)}
        />

        <form
          className={`login-form ${introDone ? 'ready' : ''} ${status === 'denied' ? 'shake' : ''}`}
          onSubmit={handleSubmit}
        >
          <label className="field">
            <span className="field-label">{LOGIN.operatorLabel}</span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={operator}
              placeholder={LOGIN.operatorPlaceholder}
              disabled={status === 'working'}
              onChange={(e) => {
                setOperator(e.target.value)
                if (status === 'denied') setStatus('idle')
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">{LOGIN.codeLabel}</span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={code}
              placeholder={LOGIN.codePlaceholder}
              disabled={status === 'working'}
              onChange={(e) => {
                setCode(e.target.value)
                if (status === 'denied') setStatus('idle')
              }}
            />
          </label>

          <button type="submit" className="login-btn" disabled={status === 'working'}>
            {status === 'working' ? LOGIN.working : LOGIN.submit}
          </button>

          <div className={`login-status ${status}`} aria-live="polite">
            {status === 'denied' ? LOGIN.denied : status === 'working' ? LOGIN.working : ' '}
          </div>
        </form>
      </div>
    </div>
  )
}
