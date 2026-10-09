# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Playable vertical slice. Stack: **React 18 + Vite + TypeScript** (single-page app, no router,
no backend). The authoritative game logic is `AURA_Four_Step_Game_Logic.md` (operator: Elias
Norberg); [spec.md](spec.md) is the broader design background. The four-step sequence runs
end-to-end against the **real** physical-room answers seeded in `src/game/content.ts`.

## Portal shell (above the game)

`src/App.tsx` owns a **`view`** state (`home | footage | emails | faq | incidents | settings |
game`) that wraps the game. `useGame()` stays mounted for every view, so popping out to the portal
and back never loses progress. Initial view is `game` when a session is restored into play
(`game.phase` is `terminal`/`won`), else `home`. `HomeScreen` (animated `AuraCore` canvas + live
clock + menu) is the entry point; **OPERATOR ACCESS** (or **RESUME SESSION** when mid-game) enters
`game`; the terminal topbar's **MENU** button returns to `home`; **NEW SESSION** resets and returns
home. The in-fiction pages (`FootagePage`, `EmailsPage`, `FaqPage`, `IncidentsPage`) are **flavor /
red-herrings only — never gate progression** (copy lives in `src/game/portalContent.ts`).
`SettingsPage` controls sound (mute/volume via `audio`) and `settings` (CRT effects, reduce motion,
text speed). Nav chrome: `PortalNav` (home big-menu variant + compact bar variant) and `PortalLayout`.

## Screens / flow

Within the `game` view, four phases switch on `game.phase` (restore picks the right one from the
saved `stepIndex`). The game is **four conceptual steps**; the engine flattens them into ordered
"flat steps" (login = flat index 0; terminal drives 1+):
1. **`login`** (`LoginScreen`) — **Step 1, Operator Authentication**: typed intro + credential form
   (User ID + Activation Key). **Both** fields validate against `LOGIN.userIdAccept` /
   `LOGIN.keyAccept` in `useGame.login()`. Wrong either → shake + AUTHENTICATION FAILED (never say
   which field).
2. **`activating`** (`ActivationScreen`) — the typed "OPERATOR AUTHENTICATED / AURA reactivating"
   sequence between the pages.
3. **`terminal`** (`Terminal`) — the main game: **Step 2** (three identity questions), **Step 3**
   (continuity token `7314` → arms the countdown), **Step 4** (manual master code). A restored
   in-progress session (`stepIndex >= 1`) resumes straight here.
4. **`won`** (`EndScreen`) — reached when Step 4 clears: types the shutdown sequence + recovered
   transfer amount (`2 850 000 SEK`), then the victory banner (THE BREACH / SECURED / GAME WON).

Two mechanics beyond plain verification:
- **Special wrong-answer responses** (`Step.rejections` + `engine.matchRejection`) — Step 4's
  `AURA1` old-code trap returns a unique "no longer valid / 204 days" message, not the generic
  `MASTER CODE REJECTED`.
- **Countdown / transfer drama** — clearing the step flagged `startsCountdown` (continuity) sets a
  `countdownDeadline` in `useGame`; `TransferMonitor.tsx` renders the Step-4 drama: `MM:SS` clock
  (keeps counting into negative `-MM:SS`), an **accelerating** progress bar, and corporate account
  balances **draining to zero** at 00:00. It self-animates with `requestAnimationFrame` from the
  deadline (so the rest of the app doesn't re-render). Visual pressure only — `ABORTAURA` always
  wins. Tunables live in `CONFIG` (`countdownSeconds`, `transfer.curveExponent`, decoy
  `transfer.accounts`); the account balances are decoys that do NOT sum to the `2 850 000 SEK`
  end reveal.

## Code map

- `src/game/content.ts` — **single source of truth** for all content: `CONFIG` (countdown duration),
  `STAGES` (4 stages = the four steps, each with sequential `steps`; each step has an optional human
  `preamble`, terse `prompt`, `accept`/`onSuccess[]`/`onReject`, optional `rejections` and
  `startsCountdown`), `LOGIN` copy + credential `accept` lists, `buildActivationLines()`,
  `buildEndingLines()`, `END_BANNER`, scripted `FREE_TEXT`. Edit puzzles and all on-screen copy here.
- `src/game/engine.ts` — pure, React-free logic: `normalize`/`checkAnswer` (case/space-insensitive),
  `matchRejection` (special wrong-answer lookup), `answerFreeText` (whole-word keyword matching so
  short words like "hi" don't match inside "which"), flat-step progression, `accessLevelAt`.
- `src/game/useGame.ts` — the hook: owns `phase`, `operatorId`, `countdownDeadline`, `login()`,
  `finishActivation()`, `submit()`, `reset()`. `login()` checks both credentials. `submit()` routes
  input (answer vs. free-text vs. `help`/`status`/`repeat`/`hint`), applies `matchRejection` before
  the generic reject, and arms the countdown. Exposes `countdownSeconds` (negative once past zero).
  Persists `{stepIndex, log, operatorId, countdownDeadline}` to `localStorage` (`aura.save`) —
  storing an absolute deadline so a refresh restores remaining time; initialized lazily to avoid a
  persist/hydrate race.
- `src/game/portalContent.ts` — in-fiction flavor copy for the portal pages (cameras, emails, FAQ,
  incidents, home strings). **Atmosphere only, not puzzle data** — never encode step answers here.
- `src/game/settings.ts` — `settings` singleton + `useSettings()` (same pattern as `audio`):
  `crtEffects`, `reduceMotion`, `textSpeed`. Persisted to `localStorage` (`aura.settings`). `App`
  gates the CRT overlays on it; `useTypewriter` reads `typeSpeedFactor`/`instantText`; `AuraCore`
  reads `reduceMotion`.
- `src/game/useTypewriter.ts` — the movie-style typing effect. Types lines appended after mount
  char-by-char; shows pre-existing (restored) lines instantly; `skip()` = click-to-skip. Honors
  the `textSpeed` setting. `freshTerminal` is consumed ~1.5s after activation so returning from the
  portal (or a refresh) restores the terminal log instantly instead of re-typing it.
- `src/game/audio.ts` — fully **synthesized** Web Audio engine (`audio` singleton): UI blips
  (`keyTick`/`submit`/`uiBlip`), a cold/industrial `success` (low filtered tone + sub, deliberately
  unsettling, not a happy melody) and `error`, dark `boot`/`activation` stings, a `win` sting, a
  teletype `type()` tick
  (driven by the typewriter as AURA prints), a steady ambient "soundtrack" hum that plays from the
  login screen through gameplay, and an escalating Step-4 transfer alarm (dissonant beat + sub-bass,
  tempo/pitch/volume rise toward 00:00). The `AudioContext` is created lazily on the first user
  gesture (`unlock()`, called from login field focus/submit + terminal interaction), since browsers
  block audio before interaction. Ambient/transfer are **intent-based** (`setAmbient`/`setTransfer`)
  so a gesture after a page-restore still starts them. `setVolume`/`getLevel` (an AnalyserNode RMS)
  back the Settings slider and the audio-reactive `AuraCore`. Mute/volume persist to `localStorage`
  (`aura.muted`/`aura.volume`); `useMuted`/`useVolume` let controls observe them. No audio files —
  safe for offline/GitHub Pages, no copyright.
- `src/components/` — `TypedBlock` (types a fixed sequence, used by login/activation),
  `LoginScreen`, `ActivationScreen`, `Terminal` (typewriter log + input, submit on Enter,
  input locked while typing), `StatusBar`, `TransferMonitor` (Step-4 blinking red danger triangle +
  timer + accelerating progress bar + draining accounts; self-animating, shown only while the
  countdown is active), `MuteButton` (topbar; toggles all synthesized audio).
- `src/useViewportHeight.ts` — mirrors `visualViewport` into the `--app-height` custom property.
  `100%`/`100vh`/`100dvh` all fail to account for the iOS keyboard, which would leave the
  terminal's bottom-anchored input underneath it.
- `src/styles.css` — the whole security-terminal theme (CRT scanlines, flicker, blinking cursor,
  login card, screen transitions, amber/green palette), plus the responsive layer at the bottom.

## Mobile

The page is played on phones, so treat these as invariants rather than polish:

- **Inputs must be ≥16px on touch** (`@media (pointer: coarse)`). Below that, iOS Safari zooms
  the page on focus and never zooms back out.
- **Height comes from `--app-height`**, never `100vh`. See `useViewportHeight.ts` above.
- **`body` doesn't scroll** — the app shell is fixed-height and `.terminal-log` scrolls
  internally. The centred screens (login/activation/end) scroll themselves and centre via
  `margin-block: auto`, which degrades to top-aligned instead of clipping on short viewports.
- **Answer fields need `autoCorrect`/`autoCapitalize` off**; iOS autocorrect will silently
  rewrite a puzzle answer on submit.
- Keep taps ≥44px. For small chrome like RESET, use an invisible `::after` hit area rather than
  inflating the visible control.

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
- Dev server: `npm run dev` — serves at **http://localhost:5173/**
- Production build (runs `tsc -b` type-check, then Vite): `npm run build`
- Preview the built output: `npm run preview`

No test runner or linter is configured yet. `npm run build` is the type-check gate.

## Deployment (GitHub Pages)

Pushing to `main` triggers `.github/workflows/gh-pages.yml`, which runs `npm run build` and
publishes via `upload-pages-artifact` + `deploy-pages`. Live at **https://aura-secure.se/** — a
custom apex domain set in the repo's Pages settings. GitHub redirects the old project URL
https://benjaminaronsson.github.io/AURA/ to it.

Three settings are coupled — changing one in isolation breaks the deploy:

- `base: '/'` in `vite.config.ts` must match how the site is *served*, not the repo name. On the
  custom domain the site is the domain root, so assets live at `/assets/*`. This was `'/AURA/'`
  while it was a project Pages site; leaving it that way after the domain switch makes the
  deployed page load `index.html` but 404 every script and stylesheet — a blank screen. The
  custom domain lives in Pages settings, not a `CNAME` file in the artifact.
- `build.outDir: '_site'` matches the `upload-pages-artifact` default `path: _site/`. If you
  rename it to `dist`, add an explicit `path:` to the upload step.
- Despite the `_site` name this is **not** a Jekyll site. Jekyll never runs on the artifact, so
  no `.nojekyll` file is needed and `jekyll-build-pages` must not be added back — it would
  fight the Vite build over the same directory.

To debug a broken deploy, compare what the HTML requests against what was actually published:
`curl -s https://aura-secure.se/ | grep assets`, then `curl -o /dev/null -w
"%{http_code}"` that asset path.
