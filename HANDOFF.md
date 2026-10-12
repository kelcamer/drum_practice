# Handoff — Groove Library (drum_practice)

Live site: https://kelcamer.github.io/drum_practice/ (GitHub Pages, deployed by
`.github/workflows/deploy.yml` on every push to `main`).
Working branch: `claude/serene-gauss-uuz1mb`. Main and the branch are kept in sync.

## Stack
Vite + React, no backend. Audio is synthesized with Web Audio (`src/audio.js`).
Practice data lives only in the browser's `localStorage`.

## Files
- `src/grooves.js` — every groove: `P(name, category, bpm, sub, beats, desc, lanes)`.
  Lane keys: k kick · s snare · h hi-hat · r ride · c crash · t high tom · f floor tom.
  Toms rows only render when a groove uses them (`visibleLanes`).
- `src/practice.js` — practice log, weekly streak, crash-safe session checkpoint, backup.
- `src/levels.js` — 29-level overall ladder (to 10,000 hr) and 17-level per-riff ladder.
- `src/App.jsx` — UI. `src/styles.css` — styles.

## Do not break
- Storage key `groove-library.practice.v1` and its shape
  `{ v, totalMs, riffs, days, sessions }` hold the user's levels. Never rename it.
- Riff time is keyed by groove **name** — renaming a groove orphans its logged time.

## The user
- Kel is a drummer at **Level 8 — Pocket Hunter** (3+ hr logged) as of
  2026-10-12. Was restored to Level 6 on 2026-10-08 after browser storage was
  cleared; Safari/home-screen storage can be wiped or kept separate.
  If the app ever shows less, `#restore-level-8` or "Add time you didn't log"
  puts it back.
- Kit: kick, snare, hi-hat, ride, high tom, floor tom (+ crash in app).
- Practises weekly, so the streak counts Mon–Sun weeks.
- Prefers encouragement over criticism.
- Current working tempos (from notes): Cold Sweat 60, Funky Drummer 76,
  Syncopated Funk 74, Dilla Feel 76, West Coast Bounce 70, Boom Bap 120,
  Lo-Fi 84, Bossa Nova 80, Jazz Waltz 185, Swing Ride 150.

## Done so far
- Updated default tempos from practice notes.
- Added high/floor tom voices, pads (H/J) and lanes.
- Added "Polyrhythms & Toms" (3:2, 2:3, 3:4, 4:3, tresillo, bembé, tom grooves).
- Added "Paradiddles": single, double, triple, paradiddle-diddle, inverted,
  reverse + Paradiddle Groove, Inverted Paradiddle Funk, Tom Paradiddle.
  Rudiment drills show right hand on the Hi Tom row, left on the Snare row.
- Weekly streak; running sessions checkpoint every second and are banked on
  next open; "Add time you didn't log" form; backup download/restore;
  confirm before reset; `#restore-level-N` link tops the log up to a level.

## Ideas not done
- Remember a per-groove tempo the user last used.
- Practice notes inside the app (the user keeps notes elsewhere).
