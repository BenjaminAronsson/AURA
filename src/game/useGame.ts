/**
 * AURA — useGame hook
 * ===================
 * Drives three screens — LOGIN → ACTIVATING → TERMINAL — wrapping the pure
 * engine in React state and persisting progress to localStorage so a refresh
 * (common mid-escape-room) restores the team's position.
 *
 * Stage 1 (the administrator access code) is handled by the LOGIN screen.
 * Clearing it advances to step index 1 and plays the activation sequence;
 * everything from Stage 2 onward happens in the TERMINAL.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  FREE_TEXT_FALLBACK,
  LOGIN,
  STAGES,
  type Stage,
  type Step,
} from './content'
import {
  FLAT_STEPS,
  accessLevelAt,
  answerFreeText,
  checkAnswer,
  currentFlatStep,
  isComplete,
  isQuery,
  normalize,
} from './engine'

const SAVE_KEY = 'aura.save'

export type Phase = 'login' | 'activating' | 'terminal' | 'won'
export type LineKind = 'system' | 'aura' | 'input' | 'error' | 'success'

export interface LogLine {
  kind: LineKind
  text: string
}

interface SaveData {
  stepIndex: number
  log: LogLine[]
  operatorId: string
}

const CODE_STEP = FLAT_STEPS.find((fs) => fs.step.id === LOGIN.codeStepId) ?? FLAT_STEPS[0]

function stageIntroLines(stage: Stage): LogLine[] {
  return [
    { kind: 'system', text: '' },
    ...stage.intro.map((text) => ({ kind: 'system' as const, text })),
    { kind: 'system', text: '' },
  ]
}

/** Intro (if first of stage) + human preamble + the prompt, for one step. */
function stepEntryLines(stepIndex: number): LogLine[] {
  const fs = currentFlatStep(stepIndex)
  if (!fs) return []
  const lines: LogLine[] = []
  if (fs.firstOfStage) lines.push(...stageIntroLines(fs.stage))
  if (fs.step.preamble) lines.push(...fs.step.preamble.map((text) => ({ kind: 'aura' as const, text })))
  lines.push({ kind: 'aura', text: fs.step.prompt })
  return lines
}

/** Just the prompt line for the current step (used by "repeat"). */
function promptLine(stepIndex: number): LogLine[] {
  const fs = currentFlatStep(stepIndex)
  return fs ? [{ kind: 'aura', text: fs.step.prompt }] : []
}

/** The log the TERMINAL opens with, right after the activation sequence. */
function terminalSeed(operatorId: string): LogLine[] {
  const op = operatorId.trim() ? operatorId.trim().toUpperCase() : 'UNREGISTERED'
  return [
    { kind: 'success', text: `OPERATOR ${op} — ACCESS LEVEL 01 CONFIRMED.` },
    ...stepEntryLines(1),
  ]
}

function load(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaveData
    if (typeof parsed.stepIndex !== 'number' || !Array.isArray(parsed.log)) return null
    return { stepIndex: parsed.stepIndex, log: parsed.log, operatorId: parsed.operatorId ?? '' }
  } catch {
    return null
  }
}

export function useGame() {
  // Initialize synchronously from storage so nothing races the first paint.
  const [initial] = useState(() => load())
  const [stepIndex, setStepIndex] = useState(initial?.stepIndex ?? 0)
  const [log, setLog] = useState<LogLine[]>(initial?.log ?? [])
  const [operatorId, setOperatorId] = useState(initial?.operatorId ?? '')
  // Restore to the right screen: completed → end page, in-progress → terminal, else login.
  const [phase, setPhase] = useState<Phase>(() => {
    const idx = initial?.stepIndex ?? 0
    if (idx >= FLAT_STEPS.length) return 'won'
    if (idx >= 1) return 'terminal'
    return 'login'
  })
  // Was the terminal just reached live (type it out) vs. restored (show instantly)?
  const [freshTerminal, setFreshTerminal] = useState(false)

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ stepIndex, log, operatorId } satisfies SaveData),
      )
    } catch {
      /* storage unavailable — progress simply won't persist */
    }
  }, [stepIndex, log, operatorId])

  const append = useCallback((lines: LogLine[]) => {
    setLog((prev) => [...prev, ...lines])
  }, [])

  /** LOGIN: validate the administrator access code. Returns true on success. */
  const login = useCallback((operator: string, code: string): boolean => {
    if (!checkAnswer(CODE_STEP.step, code)) return false
    const id = operator.trim()
    setOperatorId(id)
    setStepIndex(1)
    setLog(terminalSeed(id))
    setPhase('activating')
    return true
  }, [])

  /** Called by the activation screen when its sequence finishes. */
  const finishActivation = useCallback(() => {
    setFreshTerminal(true)
    setPhase('terminal')
  }, [])

  const submit = useCallback(
    (raw: string) => {
      const input = raw.trim()
      if (!input) return

      const echo: LogLine[] = [{ kind: 'input', text: '> ' + input }]

      if (isComplete(stepIndex)) {
        append([...echo, { kind: 'system', text: 'SESSION TERMINATED. NO FURTHER INPUT ACCEPTED.' }])
        return
      }

      const fs = currentFlatStep(stepIndex)!

      if (normalize(input) === 'hint') {
        append([
          ...echo,
          {
            kind: 'aura',
            text: fs.step.hint ? 'ADVISORY: ' + fs.step.hint : 'NO ADVISORY AVAILABLE FOR CURRENT REQUEST.',
          },
        ])
        return
      }

      if (normalize(input) === 'repeat') {
        append([...echo, ...promptLine(stepIndex)])
        return
      }

      if (normalize(input) === 'status') {
        append([
          ...echo,
          { kind: 'aura', text: `FACILITY STATUS: ${isComplete(stepIndex) ? 'RELEASED' : 'LOCKDOWN'}` },
          { kind: 'aura', text: `ACCESS LEVEL: ${String(accessLevelAt(stepIndex)).padStart(2, '0')}` },
          { kind: 'aura', text: `ACTIVE MODULE: ${fs.stage.title}` },
        ])
        return
      }

      // Free-text queries → scripted response; fall through to step guidance.
      if (isQuery(input)) {
        const scripted = answerFreeText(input)
        if (scripted !== FREE_TEXT_FALLBACK) {
          append([...echo, { kind: 'aura', text: scripted }])
        } else if (fs.step.hint) {
          append([...echo, { kind: 'aura', text: 'ADVISORY: ' + fs.step.hint }])
        } else {
          append([...echo, { kind: 'aura', text: scripted }])
        }
        return
      }

      // Otherwise treat as an answer attempt.
      if (checkAnswer(fs.step, input)) {
        const next = stepIndex + 1
        if (currentFlatStep(next)) {
          const lines: LogLine[] = [...echo, { kind: 'success', text: fs.step.onSuccess }]
          if (typeof fs.step.accessLevel === 'number') {
            lines.push({ kind: 'success', text: `ACCESS LEVEL: ${String(fs.step.accessLevel).padStart(2, '0')}` })
          }
          lines.push(...stepEntryLines(next))
          append(lines)
          setStepIndex(next)
        } else {
          // Final step cleared → hand off to the victory end page.
          setStepIndex(next)
          setPhase('won')
        }
      } else {
        append([
          ...echo,
          { kind: 'error', text: 'VERIFICATION FAILED.' },
          { kind: 'error', text: 'INVALID CREDENTIALS.' },
        ])
      }
    },
    [append, stepIndex],
  )

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      /* ignore */
    }
    setStepIndex(0)
    setLog([])
    setOperatorId('')
    setFreshTerminal(false)
    setPhase('login')
  }, [])

  const complete = isComplete(stepIndex)
  const activeStage: Stage | null = currentFlatStep(stepIndex)?.stage ?? null

  return {
    phase,
    operatorId,
    log,
    freshTerminal,
    login,
    finishActivation,
    submit,
    reset,
    complete,
    accessLevel: accessLevelAt(stepIndex),
    activeModule: complete ? 'OFFLINE' : activeStage?.title ?? '—',
    progress: { current: Math.min(stepIndex, FLAT_STEPS.length), total: FLAT_STEPS.length },
  }
}

// Re-export so UI modules can read static copy without a second import path.
export { LOGIN, STAGES }
export type { Step }
