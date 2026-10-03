# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Playable vertical slice. Stack: **React 18 + Vite + TypeScript** (single-page app, no router,
no backend). [spec.md](spec.md) is the authoritative design. All five stages run end-to-end
against **placeholder** puzzle answers seeded in `src/game/content.ts` — replace those with the
real physical-room answers.

## Screens / flow

Four phases, switched in `src/App.tsx` on `game.phase` (restore picks the right one from the
saved `stepIndex`):
1. **`login`** (`LoginScreen`) — page 1 / question 1: typed intro + credential form (operator ID
   + admin access code). The access code validates against stage 1 (`auth.code`); the operator ID
   is free text and is echoed back later ("OPERATOR <ID>…") for a human touch. Wrong code → shake
   + ACCESS DENIED.
2. **`activating`** (`ActivationScreen`) — the typed "AURA operating again" reactivation sequence
   between the two pages.
3. **`terminal`** (`Terminal`) — page 2: the main game from stage 2 onward (questions 2–8 across
   stages 2–5). A restored in-progress session (`stepIndex >= 1`) resumes straight here.
4. **`won`** (`EndScreen`) — reached when the final step clears: types the shutdown sequence, then
   reveals the victory banner (THE BREACH / SECURED / GAME WON) and a NEW SESSION reset.

## Code map

- `src/game/content.ts` — **single source of truth** for all content: `STAGES` (5 stages, each
  with sequential `steps`; each step has an optional human `preamble` + terse `prompt`), `LOGIN`
  copy, `buildActivationLines()`, scripted `FREE_TEXT`, `SHUTDOWN_SEQUENCE`. Edit puzzles and
  all on-screen copy here.
- `src/game/engine.ts` — pure, React-free logic: `normalize`/`checkAnswer` (case/space-insensitive),
  `answerFreeText` (whole-word keyword matching so short words like "hi" don't match inside
  "which"), flat-step progression, `accessLevelAt`.
- `src/game/useGame.ts` — the hook: owns `phase`, `operatorId`, `login()`, `finishActivation()`,
  `submit()`, `reset()`. Routes input (answer vs. free-text vs. `help`/`status`/`repeat`/`hint`);
  unrecognized questions during a step fall through to that step's advisory. Persists
  `{stepIndex, log, operatorId}` to `localStorage` (`aura.save`), initialized lazily during
  render to avoid a persist/hydrate race.
- `src/game/useTypewriter.ts` — the movie-style typing effect. Types lines appended after mount
  char-by-char; shows pre-existing (restored) lines instantly; `skip()` = click-to-skip.
- `src/components/` — `TypedBlock` (types a fixed sequence, used by login/activation),
  `LoginScreen`, `ActivationScreen`, `Terminal` (typewriter log + input, submit on Enter,
  input locked while typing), `StatusBar`.
- `src/styles.css` — the whole security-terminal theme (CRT scanlines, flicker, blinking cursor,
  login card, screen transitions, amber/green palette).

## What AURA is

AURA is the interactive webpage for **The Breach**, a physical escape-game. It presents an
in-fiction corporate **security system** that gates the game's progression. The webpage is a
*shared team tool*, deliberately **not** the main source of story or puzzles — most of the
narrative lives in physical objects, documents, and photographs in the room. See [spec.md](spec.md)
for the authoritative design; the points below are the constraints most likely to be violated
during implementation.

## Core loop

The whole experience runs on one loop:

> Ask → receive information (found physically) → verify → grant access → ask for the next required action.

The webpage should require information that can only be obtained **outside** the webpage, so
that one person cannot sit at the keyboard and finish the game alone. Design every interaction
to depend on a physical discovery.

## AURA voice — hard constraints

AURA must read like enterprise security software, not a chatbot or a game host.

- **Tone:** professional, procedural, precise, neutral, security-oriented. Concise technical
  language and status lines (`ACCESS GRANTED.`, `VERIFICATION FAILED.`, `ACCESS LEVEL: 02`).
- **AURA must NOT:** act like a human player; mislead players; solve puzzles; hand out hints
  freely; become chatty; or become the primary storyteller.
- **Never** celebratory/coaching copy ("Great job!", "You're getting close!", "Look over there!").
- On wrong answers: respond as a security system (`VERIFICATION FAILED. / INVALID CREDENTIALS.`)
  and **do not reveal the correct answer**. Hints, if any, must be tightly controlled.

## Interaction model

- **Primary:** structured verification — the system asks for a specific code/name/serial/answer,
  the team submits it, AURA verifies and unlocks the next capability.
- **Secondary:** limited free-text questions ("What systems are locked?", "Can you repeat the
  last instruction?"). Free-text is a support feature, never the path of progression.

## Game structure (4–5 stages)

1. **Initial Authentication** — introduce AURA + lockdown; first physical discovery.
2. **Investigation** — access incident info / "security footage" (often references *physical*
   printed photos rather than real video).
3. **System Investigation** — identify details from several clues; AURA verifies conclusions.
4. **Security Incident / Containment** — escalation; multiple clues identify a procedure.
5. **Final Shutdown** — final gate requiring information accumulated across earlier stages,
   not a brand-new puzzle.

## Hidden narrative (handle with care)

The concealed truth is that AURA is **not trustworthy** and is tied to an attempt to sell
confidential office information to competitors. This reveal should emerge through physical
evidence and progression — AURA should not simply announce it. Keep this in mind, but don't
let the UI spoil it.

## Division of responsibility

- **Physical room** owns: story, clues, evidence, documents, photos, objects, puzzle data.
- **AURA webpage** owns: questions, authentication, verification, access control, progression,
  system status, controlled information retrieval, security messages, stage transitions.

## Open design questions

Several decisions are intentionally undefined in the spec (exact stage count, the puzzle in
each stage, how hints work, when/how the true purpose is revealed, final shutdown mechanism,
visual style, whether to simulate modules like logs/cameras/personnel/network). Treat these as
open — confirm with the user rather than assuming.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` — serves at **http://localhost:5173/AURA/**, not `/` (see `base` below)
- Production build (runs `tsc -b` type-check, then Vite): `npm run build`
- Preview the built output: `npm run preview`

No test runner or linter is configured yet. `npm run build` is the type-check gate.

## Deployment (GitHub Pages)

Pushing to `main` triggers `.github/workflows/gh-pages.yml`, which runs `npm run build` and
publishes via `upload-pages-artifact` + `deploy-pages`. Live at
https://benjaminaronsson.github.io/AURA/.

Three settings are coupled — changing one in isolation breaks the deploy:

- `base: '/AURA/'` in `vite.config.ts` must match the repo name. It's a *project* Pages site, so
  assets live under `/AURA/`. Without it Vite emits root-absolute `/assets/*` URLs and the
  deployed page loads `index.html` but 404s every script and stylesheet — a blank screen.
- `build.outDir: '_site'` matches the `upload-pages-artifact` default `path: _site/`. If you
  rename it to `dist`, add an explicit `path:` to the upload step.
- Despite the `_site` name this is **not** a Jekyll site. Jekyll never runs on the artifact, so
  no `.nojekyll` file is needed and `jekyll-build-pages` must not be added back — it would
  fight the Vite build over the same directory.

To debug a broken deploy, compare what the HTML requests against what was actually published:
`curl -s https://benjaminaronsson.github.io/AURA/ | grep assets`, then `curl -o /dev/null -w
"%{http_code}"` that asset path.
