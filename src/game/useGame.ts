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
  CONFIG,
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
  matchRejection,
  normalize,
} from './engine'
import { audio } from './audio'

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
  /** Absolute epoch-ms deadline for the Step-4 countdown, or null if not started. */
  countdownDeadline: number | null
}

/** Validate a value against a list of accepted answers (case/space-insensitive). */
function matchesAny(accept: string[], input: string): boolean {
  const n = normalize(input)
  return n.length > 0 && accept.some((a) => normalize(a) === n)
}

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
    return {
      stepIndex: parsed.stepIndex,
      log: parsed.log,
      operatorId: parsed.operatorId ?? '',
      countdownDeadline:
        typeof parsed.countdownDeadline === 'number' ? parsed.countdownDeadline : null,
    }
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
  const [countdownDeadline, setCountdownDeadline] = useState<number | null>(
    initial?.countdownDeadline ?? null,
  )
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
        JSON.stringify({ stepIndex, log, operatorId, countdownDeadline } satisfies SaveData),
      )
    } catch {
      /* storage unavailable — progress simply won't persist */
    }
  }, [stepIndex, log, operatorId, countdownDeadline])

  const complete = isComplete(stepIndex)

  const append = useCallback((lines: LogLine[]) => {
    setLog((prev) => [...prev, ...lines])
  }, [])

  /** LOGIN: validate both operator credentials. Returns true on success. */
  const login = useCallback((userId: string, key: string): boolean => {
    if (!matchesAny(LOGIN.userIdAccept, userId) || !matchesAny(LOGIN.keyAccept, key)) {
      return false
    }
    const id = userId.trim()
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
    // Consume the "type it out" flag shortly after the terminal mounts. The
    // typewriter snapshots this at mount, so clearing it later is harmless for
    // the initial reveal but makes any later remount (e.g. returning from the
    // portal MENU, or a refresh) restore the log instantly instead of re-typing.
    window.setTimeout(() => setFreshTerminal(false), 1500)
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
        audio.success()
        // Clearing the continuity step arms the financial-transfer countdown.
        if (fs.step.startsCountdown) {
          setCountdownDeadline(Date.now() + CONFIG.countdownSeconds * 1000)
        }
        if (currentFlatStep(next)) {
          const lines: LogLine[] = [
            ...echo,
            ...fs.step.onSuccess.map((text) => ({ kind: 'success' as const, text })),
          ]
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
        audio.error()
        // Special-case wrong answers (e.g. the AURA1 trap) first, else generic.
        const special = matchRejection(fs.step, input)
        if (special) {
          append([...echo, ...special.map((text) => ({ kind: 'error' as const, text }))])
        } else {
          append([...echo, { kind: 'error', text: fs.step.onReject ?? 'VERIFICATION FAILED.' }])
        }
      }
    },
    [append, stepIndex],
  )

  const reset = useCallback(() => {
    audio.stopAll()
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      /* ignore */
    }
    setStepIndex(0)
    setLog([])
    setOperatorId('')
    setCountdownDeadline(null)
    setFreshTerminal(false)
    setPhase('login')
  }, [])

  const activeStage: Stage | null = currentFlatStep(stepIndex)?.stage ?? null
  // Progress is shown as conceptual step (1..4), not flat-step index.
  const stageNumber = activeStage ? STAGES.findIndex((s) => s.id === activeStage.id) + 1 : 0
  const stepProgress = {
    current: complete ? STAGES.length : Math.max(1, stageNumber),
    total: STAGES.length,
  }

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
    progress: stepProgress,
    /** Absolute epoch-ms deadline for the transfer countdown; null if inactive. */
    countdownDeadline: complete ? null : countdownDeadline,
    /** Total configured countdown duration, in ms. */
    countdownDurationMs: CONFIG.countdownSeconds * 1000,
  }
}

// Re-export so UI modules can read static copy without a second import path.
export { LOGIN, STAGES }
export type { Step }
