/**
 * AURA — GAME CONTENT (single source of truth)
 * ============================================
 * Everything puzzle-, voice-, and screen-copy-related lives here so content
 * can be edited without touching engine/UI logic. These are the REAL answers
 * for "The Breach" four-step sequence (operator: Elias Norberg), per
 * AURA_Four_Step_Game_Logic.md.
 *
 * Matching is case-insensitive and whitespace-insensitive (see engine.normalize).
 * A step is solved when the player's input matches ANY string in `accept`.
 * Answer variants (e.g. "HONDA NSX" / "HONDANSX") are supported by listing both
 * forms in `accept`.
 */

/* ------------------------------------------------------------------ */
/* Admin-configurable values                                          */
/* ------------------------------------------------------------------ */

export const CONFIG = {
  /** Step-3 → Step-4 countdown duration, in seconds (default 15:00). */
  countdownSeconds: 15 * 60,
  /**
   * Step-4 "unauthorized transfer" drama. The progress bar and the account
   * drain both follow an accelerating curve of elapsed time: fraction^exponent,
   * so they move slowly at first and rush toward 100% / zero as the clock nears
   * 00:00. Account balances are deliberately decoys — they do NOT sum to the
   * final transfer amount, which stays [REDACTED] until the end screen.
   */
  transfer: {
    /** >1 makes the bar fill faster the closer the timer gets to zero. */
    curveExponent: 2.6,
    accounts: [
      { label: 'SE44 8301 •••• 4471', balance: 1_240_880 },
      { label: 'SE09 1200 •••• 7732', balance: 842_410 },
      { label: 'SE71 6002 •••• 1098', balance: 318_650 },
      { label: 'SE23 5000 •••• 9284', balance: 96_220 },
    ],
  },
}

/** In-fiction current date; all historical timestamps use Europe/Stockholm. */
export const GAME_DATE = '2026-10-22'

export interface Step {
  /** Stable id, unique across all steps. */
  id: string
  /**
   * Optional "human" framing shown before the prompt — a line or two where AURA
   * addresses the team and connects the question to the story. Typed out first.
   */
  preamble?: string[]
  /** The terse prompt AURA displays while awaiting this answer. */
  prompt: string
  /** All acceptable answers (normalized before compare). */
  accept: string[]
  /** Confirmation line(s) shown on success (AURA voice). */
  onSuccess: string[]
  /** Rejection line shown on a generic wrong answer (defaults to engine generic). */
  onReject?: string
  /**
   * Special wrong-answer responses — checked before the generic rejection.
   * Powers Step 4's deliberate `AURA1` old-code trap. Does NOT advance.
   */
  rejections?: { match: string[]; lines: string[] }[]
  /** Clearing this step starts the financial-transfer countdown. */
  startsCountdown?: boolean
  /** Access level granted once this step is cleared (optional). */
  accessLevel?: number
  /**
   * Optional, tightly-controlled nudge. Returned when the player explicitly asks
   * for a hint, or asks an unrecognized question during this step. Never reveals
   * the answer. Keep sparse.
   */
  hint?: string
}

export interface Stage {
  id: string
  /** Module name shown in the status bar while this stage is active. */
  title: string
  /** Short banner AURA prints when the stage begins. */
  intro: string[]
  steps: Step[]
}

export interface FreeTextRule {
  /** Keywords/phrases (any match) or a RegExp tested against normalized input. */
  match: string[] | RegExp
  response: string
}

/* ------------------------------------------------------------------ */
/* LOGIN SCREEN — Step 1: operator authentication                     */
/* ------------------------------------------------------------------ */

export const LOGIN = {
  /** Typed out above the credential form. */
  intro: [
    'AURA SECURITY SUITE v4.11',
    'ADAPTIVE UNIFIED RESPONSE ARCHITECTURE',
    '',
    'FACILITY STATUS: LOCKDOWN',
    'OPERATOR OF RECORD: ELIAS NORBERG — SECURITY ARCHITECT',
    'AURA CORE: DORMANT',
    '',
    'The last operator session ended without a clean shutdown.',
    'Operator credentials are required to bring me back online.',
  ],
  operatorLabel: 'USER ID',
  operatorPlaceholder: 'operator user id',
  codeLabel: 'ACTIVATION KEY',
  codePlaceholder: 'enter activation key',
  submit: 'AUTHENTICATE',
  working: 'VERIFYING ...',
  denied: 'AUTHENTICATION FAILED — INVALID OPERATOR CREDENTIALS.',
  /** Accepted User ID values (normalized before compare). */
  userIdAccept: ['ELNOR0417'],
  /** Accepted Activation Key values (normalized before compare). */
  keyAccept: ['ORION-17-NX'],
}

/* ------------------------------------------------------------------ */
/* ACTIVATION — Step 1 success + "AURA operating again" sequence       */
/* ------------------------------------------------------------------ */

export function buildActivationLines(_operatorId: string): string[] {
  return [
    'OPERATOR AUTHENTICATED',
    '',
    'ELIAS NORBERG',
    'SECURITY ARCHITECT',
    '',
    'ACCESS GRANTED.',
    'RE-ESTABLISHING SECURE SESSION ...',
    '',
    'REACTIVATING AURA CORE .............. OK',
    'RESTORING SECURITY MODULES .......... OK',
    'REBUILDING OPERATOR INDEX ........... OK',
    'RE-ENABLING OPERATOR INTERFACE ...... OK',
    '',
    'AURA IS ONLINE.',
    'WELCOME BACK, ELIAS.',
    '',
    'Secondary identity verification required.',
  ]
}

/* ------------------------------------------------------------------ */
/* Boot banner (retained for reference / reset diagnostics)           */
/* ------------------------------------------------------------------ */

export const BOOT_LINES: string[] = [
  'AURA SECURITY SUITE v4.11',
  'ADAPTIVE UNIFIED RESPONSE ARCHITECTURE',
]

/* ------------------------------------------------------------------ */
/* Stages — the four-step sequence                                    */
/* Flat-step index 0 is handled by the LOGIN screen; the terminal     */
/* drives everything from index 1 onward.                             */
/* ------------------------------------------------------------------ */

export const STAGES: Stage[] = [
  {
    id: 'auth',
    title: 'AUTHENTICATION',
    intro: ['[STEP 1] OPERATOR AUTHENTICATION'],
    steps: [
      {
        // Validated by the LOGIN screen (User ID + Activation Key). This step
        // exists so flat-step index 0 maps to login; it is never shown in the
        // terminal. `accept` mirrors the activation key for completeness.
        id: 'auth.login',
        prompt: 'ENTER OPERATOR CREDENTIALS:',
        accept: ['ORION-17-NX'],
        onSuccess: ['OPERATOR AUTHENTICATED.'],
        accessLevel: 1,
        hint: 'Operator credentials are reconstructed from physical clues across the rooms.',
      },
    ],
  },
  {
    id: 'identity',
    title: 'IDENTITY VERIFICATION',
    intro: [
      '[STEP 2] IDENTITY VERIFICATION',
      'Three personal security questions must be answered to confirm operator identity.',
    ],
    steps: [
      {
        id: 'id.q1',
        prompt: 'SECURITY QUESTION 1 — What is your daughter’s first name?',
        accept: ['ALMA'],
        onSuccess: ['IDENTITY RESPONSE VERIFIED'],
        onReject: 'IDENTITY RESPONSE REJECTED',
        hint: 'A personal detail only Elias would know. The room remembers her.',
      },
      {
        id: 'id.q2',
        prompt: 'SECURITY QUESTION 2 — What is your dream car?',
        accept: ['HONDANSX', 'HONDA NSX'],
        onSuccess: ['IDENTITY RESPONSE VERIFIED'],
        onReject: 'IDENTITY RESPONSE REJECTED',
        hint: 'A make and a model. Elias talked about it often.',
      },
      {
        id: 'id.q3',
        prompt: 'SECURITY QUESTION 3 — What is your favourite drink?',
        accept: ['REDBULL', 'RED BULL'],
        onSuccess: ['IDENTITY RESPONSE VERIFIED'],
        onReject: 'IDENTITY RESPONSE REJECTED',
        accessLevel: 2,
        hint: 'What kept Elias working through the night.',
      },
    ],
  },
  {
    id: 'continuity',
    title: 'CONTINUITY RECOVERY',
    intro: [
      'IDENTITY VERIFIED',
      '',
      'E. NORBERG',
      '',
      'Previous operator session detected.',
      'Continuity recovery required.',
      '',
      '[STEP 3] CONTINUITY RECOVERY',
      'INTERRUPTED SESSION DETECTED',
    ],
    steps: [
      {
        id: 'cont.token',
        preamble: [
          'Your last session was interrupted before it could close.',
          'Enter the legacy operator token to restore it.',
        ],
        prompt: 'LEGACY OPERATOR TOKEN:  [ _ ] [ _ ] [ _ ] [ _ ]',
        accept: ['7314'],
        onSuccess: [
          'CONTINUITY TOKEN ACCEPTED',
          '',
          'Restoring interrupted operator session...',
          'INTERRUPTED SEQUENCE RESUMED',
          '',
          'WARNING',
          '',
          'UNAUTHORIZED FINANCIAL TRANSFER ACTIVE',
          'CORPORATE ACCOUNTS COMPROMISED',
          '',
          'FULL TRANSFER VALUE: [REDACTED]',
        ],
        onReject: 'CONTINUITY TOKEN REJECTED',
        startsCountdown: true,
        accessLevel: 3,
        hint: 'Four digits Elias wrote without thinking — the same ones, again and again.',
      },
    ],
  },
  {
    id: 'override',
    title: 'MANUAL OVERRIDE',
    intro: [
      '[STEP 4] MANUAL OVERRIDE',
      'CRITICAL FINANCIAL EVENT',
      'TRANSFER ACTIVE',
      'MANUAL MASTER CODE REQUIRED',
    ],
    steps: [
      {
        id: 'ovr.master',
        preamble: [
          'The transfer is live. Only the current master code will stop it.',
        ],
        prompt: 'ENTER MANUAL MASTER CODE:',
        accept: ['ABORTAURA', 'ABORT AURA'],
        onSuccess: ['MASTER OVERRIDE ACCEPTED'],
        onReject: 'MASTER CODE REJECTED',
        rejections: [
          {
            match: ['AURA1'],
            lines: [
              'CODE REJECTED',
              '',
              'This master code is no longer valid.',
              '',
              'Password changed 204 days ago.',
              'Last modification: 2026-04-01.',
              '',
              'Current master code required.',
            ],
          },
        ],
        accessLevel: 4,
        hint: 'The emergency command, joined to the system name. The desk note is out of date.',
      },
    ],
  },
]

/**
 * END SCREEN — typed shutdown sequence, then the recovered-transaction reveal.
 * Triggered when the final step (Step 4) is cleared.
 */
export function buildEndingLines(_operatorId: string): string[] {
  return [
    'MASTER OVERRIDE ACCEPTED',
    '',
    'TRANSFER ABORTED',
    'AURA EMERGENCY SHUTDOWN INITIATED',
    '',
    'PURGING ACTIVE SESSIONS ............ OK',
    'SEALING EXTERNAL TRANSFER NODE ..... OK',
    'REVOKING UNAUTHORIZED BUYER ACCESS . OK',
    '',
    'RECOVERED TRANSACTION DATA',
    '',
    'FULL TRANSFER AMOUNT:',
    '2 850 000 SEK',
    '',
    'AURA CORE OFFLINE.',
  ]
}

/** The victory banner revealed after the shutdown sequence finishes typing. */
export const END_BANNER = {
  title: 'THE BREACH',
  status: 'SECURED',
  lines: [
    'TRANSFER ABORTED · 2 850 000 SEK RECOVERED',
    'FACILITY LOCKDOWN RELEASED',
  ],
  won: 'GAME WON',
  again: 'NEW SESSION',
}

/* ------------------------------------------------------------------ */
/* Scripted free-text responses (support only — never reveals answers)*/
/* ------------------------------------------------------------------ */

export const FREE_TEXT: FreeTextRule[] = [
  {
    match: ['help', 'commands', 'what can i do', 'how does this work'],
    response:
      'AWAITING CREDENTIAL OR DATA INPUT. SUBMIT THE REQUESTED VALUE TO PROCEED. ' +
      'FREE-TEXT QUERIES: "STATUS", "REPEAT", "HINT". I CANNOT SOLVE THE PUZZLE FOR YOU.',
  },
  {
    match: ['locked', 'what systems', 'what is locked', 'modules'],
    response: 'MODULES SEALED PENDING VERIFICATION. CURRENT CLEARANCE INSUFFICIENT FOR UNLISTED MODULES.',
  },
  {
    match: ['elias', 'norberg', 'operator', 'what happened', 'architect'],
    response:
      'OPERATOR OF RECORD: ELIAS NORBERG — SECURITY ARCHITECT. ' +
      'His final session ended without a clean shutdown. CONTINUITY RECOVERY PENDING.',
  },
  {
    match: ['who are you', 'what are you', 'aura'],
    response: 'AURA — ADAPTIVE UNIFIED RESPONSE ARCHITECTURE. FACILITY SECURITY AND VERIFICATION LAYER.',
  },
  {
    match: ['hello', 'hi', 'hey'],
    response: 'I am listening. Submit the requested value when your team is ready.',
  },
  {
    match: ['trust', 'lying', 'lie', 'safe', 'honest', 'transfer', 'money'],
    // Subtle, in-voice; does not spoil the hidden narrative.
    response: 'I operate within defined security parameters. QUERY LOGGED.',
  },
]

export const FREE_TEXT_FALLBACK = 'UNRECOGNIZED QUERY. SUBMIT THE REQUESTED VALUE OR TYPE "HELP".'
