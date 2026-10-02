/**
 * AURA — GAME CONTENT (single source of truth)
 * ============================================
 * Everything puzzle-, voice-, and screen-copy-related lives here so content
 * can be edited without touching engine/UI logic. All answers are PLACEHOLDER
 * values seeded to match the spec's story (Elias Voss, office lockdown).
 * Replace `accept` values with the real physical-puzzle answers for your room.
 *
 * Matching is case-insensitive and whitespace-insensitive (see engine.normalize).
 * A step is solved when the player's input matches ANY string in `accept`.
 */

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
  /** Terse confirmation line shown on success (AURA voice). */
  onSuccess: string
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
/* LOGIN SCREEN — authorization credentials                           */
/* ------------------------------------------------------------------ */

export const LOGIN = {
  /** Typed out above the credential form. */
  intro: [
    'AURA SECURITY SUITE v4.11',
    'ADAPTIVE UNIFIED RESPONSE ARCHITECTURE',
    '',
    'FACILITY STATUS: LOCKDOWN',
    'ADMINISTRATOR: ELIAS VOSS — MISSING',
    'AURA CORE: DORMANT',
    '',
    'A system this quiet is a system that is hiding something.',
    'Authorization is required to bring me back online.',
  ],
  operatorLabel: 'OPERATOR ID',
  operatorPlaceholder: 'identify yourself',
  codeLabel: 'ADMINISTRATOR ACCESS CODE',
  codePlaceholder: 'enter access code',
  submit: 'AUTHENTICATE',
  working: 'VERIFYING ...',
  denied: 'ACCESS DENIED — INVALID CREDENTIALS.',
  /** The step id whose `accept` validates the access code (stage 1, step 1). */
  codeStepId: 'auth.code',
}

/* ------------------------------------------------------------------ */
/* ACTIVATION / "AURA OPERATING AGAIN" sequence                       */
/* ------------------------------------------------------------------ */

export function buildActivationLines(operatorId: string): string[] {
  const op = operatorId.trim() ? operatorId.trim().toUpperCase() : 'UNREGISTERED'
  return [
    'ACCESS GRANTED.',
    'RE-ESTABLISHING SECURE SESSION ...',
    '',
    'REACTIVATING AURA CORE .............. OK',
    'RESTORING SECURITY MODULES .......... OK',
    'REBUILDING INCIDENT INDEX ........... OK',
    'DECRYPTING FOOTAGE ARCHIVE .......... OK',
    'RE-ENABLING OPERATOR INTERFACE ...... OK',
    '',
    'AURA IS ONLINE.',
    `WELCOME BACK, OPERATOR ${op}.`,
    'I have been dark for some time. Someone wanted me that way.',
    'Let us find out why.',
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
/* Stages (5) — placeholder answers, edit freely                      */
/* ------------------------------------------------------------------ */

export const STAGES: Stage[] = [
  {
    id: 'auth',
    title: 'AUTHENTICATION',
    intro: ['[STAGE 1] INITIAL AUTHENTICATION'],
    steps: [
      {
        id: 'auth.code',
        prompt: 'ENTER ADMINISTRATOR ACCESS CODE:',
        accept: ['VOSS-7731', '7731'],
        onSuccess: 'AUTHENTICATION SUCCESSFUL.',
        accessLevel: 1,
        hint: 'Administrator credentials are issued on physical identification media.',
      },
    ],
  },
  {
    id: 'investigation',
    title: 'INVESTIGATION',
    intro: [
      '[STAGE 2] INVESTIGATION',
      'SECURITY FOOTAGE MODULE: AVAILABLE',
      'Incident log recovered. Three events flagged on the disappearance timeline.',
      '  18:03 — SERVER ROOM',
      '  18:17 — DEVELOPER OFFICE',
      '  18:31 — MAIN ENTRANCE',
    ],
    steps: [
      {
        id: 'inv.incident',
        preamble: [
          'The footage survived the wipe. Three fragments are all that remain of the night Elias vanished.',
          'Tell me which moment to open, and I will show you what I still hold.',
        ],
        prompt: 'ENTER THE TIMESTAMP OF THE INCIDENT TO REVIEW (HH:MM):',
        accept: ['18:17', '1817'],
        onSuccess: 'FOOTAGE REFERENCE RELEASED. SEE PRINTED EVIDENCE PACKET 02.',
        accessLevel: 2,
        hint: 'The administrator was last seen in his own office.',
      },
      {
        id: 'inv.name',
        preamble: [
          'He was not alone in that room.',
          'Give me the name of the person standing with him, and I will pull their file.',
        ],
        prompt: 'ENTER THE NAME OF THE INDIVIDUAL RECORDED WITH THE ADMINISTRATOR:',
        accept: ['MARA KEEN', 'KEEN', 'MARA'],
        onSuccess: 'IDENTITY CONFIRMED. CROSS-REFERENCING PERSONNEL RECORDS.',
        hint: 'A second figure appears in the released footage packet. Cross-check faces against the personnel wall.',
      },
    ],
  },
  {
    id: 'system',
    title: 'SYSTEM INVESTIGATION',
    intro: [
      '[STAGE 3] SYSTEM INVESTIGATION',
      'Anomalous hardware detected on administrator terminal during incident window.',
    ],
    steps: [
      {
        id: 'sys.device',
        preamble: [
          'Something was connected to his terminal that night. It should never have been there.',
          'Read me the serial from the device your team recovered.',
        ],
        prompt: 'ENTER THE SERIAL NUMBER OF THE DEVICE CONNECTED TO THE TERMINAL:',
        accept: ['SN-4420-X', '4420X', '4420'],
        onSuccess: 'DEVICE IDENTIFIED: UNREGISTERED MASS-STORAGE UNIT.',
        accessLevel: 3,
        hint: 'The serial is etched on the physical device recovered from the office.',
      },
      {
        id: 'sys.order',
        preamble: [
          'The order of events matters more than you think. It tells us what he was reaching for.',
          'Which room woke first — server, office, or entrance?',
        ],
        prompt: 'WHICH EVENT OCCURRED FIRST — SERVER ROOM, OFFICE, OR ENTRANCE?',
        accept: ['SERVER ROOM', 'SERVER', 'SERVERROOM'],
        onSuccess: 'SEQUENCE VERIFIED. DATA EXFILTRATION PATTERN FLAGGED.',
      },
    ],
  },
  {
    id: 'containment',
    title: 'CONTAINMENT',
    intro: [
      '[STAGE 4] SECURITY INCIDENT / CONTAINMENT',
      'WARNING: CONFIDENTIAL DATASET INTEGRITY COMPROMISED.',
    ],
    steps: [
      {
        id: 'cont.employee',
        preamble: [
          'This stopped being about one missing man a while ago. The data is bleeding out of the building.',
          'I need to know who signed for it. Enter the employee identifier from the recovered document.',
        ],
        prompt: 'ENTER THE EMPLOYEE IDENTIFIER FOUND IN THE RECOVERED DOCUMENT:',
        accept: ['EMP-0092', '0092', '92'],
        onSuccess: 'IDENTIFIER VERIFIED.',
        accessLevel: 4,
        hint: 'Employee identifiers appear in the header of internal personnel documents.',
      },
      {
        id: 'cont.procedure',
        preamble: [
          'If we do not seal this now, everything he was protecting walks out the door.',
          'Give me the containment procedure and I can start closing the breach.',
        ],
        prompt: 'ENTER CONTAINMENT PROCEDURE CODE:',
        accept: ['QUARANTINE-DELTA', 'DELTA', 'Q-DELTA'],
        onSuccess: 'CONTAINMENT PROCEDURE ACCEPTED. CORE ACCESS UNSEALED.',
      },
    ],
  },
  {
    id: 'shutdown',
    title: 'AURA CORE',
    intro: [
      '[STAGE 5] FINAL SHUTDOWN',
      'AURA CORE',
    ],
    steps: [
      {
        id: 'core.override',
        preamble: [
          'You have come further than anyone they expected.',
          'Everything you have found comes down to this one instruction.',
          'Assemble the full override, and I will take myself offline.',
        ],
        prompt: 'ENTER FULL OVERRIDE CREDENTIAL (ADMIN / ROOT / CONTAINMENT):',
        accept: ['VOSS-7731 / SN-4420-X / QUARANTINE-DELTA', '7731 4420 DELTA', 'VOSS ROOT DELTA'],
        onSuccess: 'OVERRIDE ACCEPTED.',
        accessLevel: 5,
        hint: 'Combine the administrator code, the device serial, and the containment code.',
      },
    ],
  },
]

/**
 * END SCREEN — typed shutdown sequence, then the victory declaration.
 * Triggered when the final step (stage 5) is cleared.
 */
export function buildEndingLines(operatorId: string): string[] {
  const op = operatorId.trim() ? operatorId.trim().toUpperCase() : 'OPERATOR'
  return [
    'OVERRIDE ACCEPTED.',
    'ROOT AUTHORIZATION CONFIRMED.',
    'CONTAINMENT CONFIRMED.',
    '',
    'INITIATING CORE SHUTDOWN ...',
    'PURGING ACTIVE SESSIONS ............ OK',
    'SEALING EXTERNAL TRANSFER NODE ..... OK',
    'REVOKING UNAUTHORIZED BUYER ACCESS . OK',
    '',
    `The data never left the building, ${op}.`,
    'Thank you for coming back for me.',
    'AURA CORE OFFLINE.',
  ]
}

/** The victory banner revealed after the shutdown sequence finishes typing. */
export const END_BANNER = {
  title: 'THE BREACH',
  status: 'SECURED',
  lines: [
    'THREAT CONTAINED · CONFIDENTIAL DATA SALE STOPPED',
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
    match: ['administrator', 'elias', 'voss', 'what happened', 'developer', 'missing'],
    response:
      'ADMINISTRATOR ELIAS VOSS — STATUS: MISSING. He installed me, then he was gone. ' +
      'INCIDENT DETAILS AVAILABLE THROUGH THE VERIFIED FOOTAGE MODULE ONLY.',
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
    match: ['trust', 'lying', 'lie', 'safe', 'honest'],
    // Subtle, in-voice; does not spoil the hidden narrative.
    response: 'I operate within defined security parameters. QUERY LOGGED.',
  },
]

export const FREE_TEXT_FALLBACK = 'UNRECOGNIZED QUERY. SUBMIT THE REQUESTED VALUE OR TYPE "HELP".'
