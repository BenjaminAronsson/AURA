/**
 * AURA — ENGINE (pure logic, no React)
 * ====================================
 * Answer normalization/verification, scripted free-text, and flat-step
 * progression over the STAGES content. Keeping this React-free makes the
 * game rules easy to reason about and test in isolation.
 */

import {
  STAGES,
  FREE_TEXT,
  FREE_TEXT_FALLBACK,
  type Stage,
  type Step,
} from './content'

/** Flattened [stage, step] pairs in play order. */
export interface FlatStep {
  stage: Stage
  step: Step
  /** Index of this step within its stage (0-based). */
  stepInStage: number
  /** True if this is the first step of its stage. */
  firstOfStage: boolean
}

export const FLAT_STEPS: FlatStep[] = STAGES.flatMap((stage) =>
  stage.steps.map((step, i) => ({
    stage,
    step,
    stepInStage: i,
    firstOfStage: i === 0,
  })),
)

export const TOTAL_STEPS = FLAT_STEPS.length

/** Lowercase, trim, collapse internal whitespace. Used for all comparisons. */
export function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** True when `input` matches any accepted answer for the step. */
export function checkAnswer(step: Step, input: string): boolean {
  const n = normalize(input)
  if (!n) return false
  return step.accept.some((a) => normalize(a) === n)
}

/** Treat as a free-text query (vs. an answer attempt). */
export function isQuery(input: string): boolean {
  const n = normalize(input)
  if (!n) return false
  if (n.startsWith('?')) return true
  if (n.endsWith('?')) return true
  const queryWords = [
    'help',
    'status',
    'repeat',
    'hint',
    'who',
    'what',
    'where',
    'when',
    'why',
    'how',
    'can you',
    'hello',
    'hi',
    'hey',
  ]
  return queryWords.some((w) => n === w || n.startsWith(w + ' '))
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Whole-word (or whole-phrase) match, so "hi" does not fire inside "which". */
function matchesKeyword(haystack: string, keyword: string): boolean {
  const k = normalize(keyword)
  return new RegExp(`\\b${escapeRegExp(k)}\\b`).test(haystack)
}

/** Scripted free-text reply (support only — never discloses credentials). */
export function answerFreeText(input: string): string {
  const n = normalize(input).replace(/^\?+/, '').trim()
  for (const rule of FREE_TEXT) {
    if (rule.match instanceof RegExp) {
      if (rule.match.test(n)) return rule.response
    } else if (rule.match.some((m) => matchesKeyword(n, m))) {
      return rule.response
    }
  }
  return FREE_TEXT_FALLBACK
}

/** Highest access level granted up to (not including) the given step index. */
export function accessLevelAt(stepIndex: number): number {
  let level = 0
  for (let i = 0; i < stepIndex && i < FLAT_STEPS.length; i++) {
    const lvl = FLAT_STEPS[i].step.accessLevel
    if (typeof lvl === 'number' && lvl > level) level = lvl
  }
  return level
}

export function isComplete(stepIndex: number): boolean {
  return stepIndex >= TOTAL_STEPS
}

export function currentFlatStep(stepIndex: number): FlatStep | null {
  return FLAT_STEPS[stepIndex] ?? null
}
