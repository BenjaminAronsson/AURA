# AURA

Interactive security-system terminal for **The Breach**, a physical escape game.

AURA is the in-fiction corporate security system that gates the game's progression. Players find
information in the physical room — documents, photographs, objects — and submit it here; AURA
verifies each answer and unlocks the next required action. The webpage deliberately owns *none*
of the story: it handles authentication, verification, access control, and status reporting, while
the room owns the clues and the narrative.

Because every gate needs information that only exists off-screen, one person at the keyboard
cannot finish the game alone.

**Live:** https://aura-secure.se/

Built for phones as much as desktop — the room's players will mostly be holding one.

> [spec.md](spec.md) is the authoritative design document and contains full spoilers, including
> the game's concealed narrative. Don't hand it to players.

## Stack

React 18 + Vite + TypeScript. Single page, no router, no backend. Progress persists to
`localStorage` under the key `aura.save`, so a reloaded or reopened session resumes where it
left off.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173/
```

```bash
npm run build    # type-check (tsc -b) + production build into _site/
npm run preview  # serve the built output
```

There's no test runner or linter configured; `npm run build` is the type-check gate.

## Game flow

Five stages, eight questions, across four screens:

1. **Login** — typed intro, then operator ID + admin access code. The code is verified; the
   operator ID is free text and gets echoed back later for flavour.
2. **Activation** — the "AURA operating again" reactivation sequence.
3. **Terminal** — the main loop from stage 2 onward. Each step poses a prompt, accepts an answer,
   and either grants access or reports a verification failure. Limited free-text support
   (`help`, `status`, `repeat`, `hint`) exists but is never the path forward.
4. **End** — shutdown sequence, then the victory banner and a reset.

## Editing content

**All on-screen copy and every puzzle answer live in [`src/game/content.ts`](src/game/content.ts).**
That's the single source of truth — stage definitions, prompts, login copy, the activation and
shutdown sequences, and the scripted free-text responses. You should not need to touch components
to change the game.

The answers currently in that file are **placeholders**. Replace them with the real answers from
the physical room before running the game.

Supporting code:

| Path | Role |
| --- | --- |
| `src/game/engine.ts` | Pure logic: answer normalisation and matching, step progression, access levels |
| `src/game/useGame.ts` | The game hook: phase, input routing, persistence |
| `src/game/useTypewriter.ts` | Movie-style typing effect, with click-to-skip |
| `src/useViewportHeight.ts` | Mirrors the visual viewport into `--app-height` so the mobile keyboard can't cover the input |
| `src/components/` | Screens: login, activation, terminal, end, status bar |
| `src/styles.css` | The whole CRT/terminal theme, including the responsive and touch rules |

### A note on voice

AURA reads as enterprise security software — procedural, neutral, terse (`ACCESS GRANTED.`,
`VERIFICATION FAILED.`, `ACCESS LEVEL: 02`). It never congratulates, coaches, points players at
things, or reveals a correct answer after a wrong submission. Keep new copy in that register.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via
[`.github/workflows/gh-pages.yml`](.github/workflows/gh-pages.yml).

The Vite config sets `base: '/'` and `outDir: '_site'`. The `base` must match how the site is
*served*: it's on a custom apex domain, so the site is the domain root. (It was `'/AURA/'` back
when this was a project Pages site at a `/AURA/` subpath — a mismatched `base` makes the deployed
page load `index.html` but 404 every script and stylesheet.) The `_site` output directory matches
the default the Pages upload action looks for — rename it only alongside an explicit `path:` on
that step. Despite the directory name this is not a Jekyll site.
