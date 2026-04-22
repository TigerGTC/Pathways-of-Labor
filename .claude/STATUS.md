# Project Status

**Last updated:** 2026-04-16

## Current State
v1 build complete. Single-file app `index.html` is 1058 lines, 45KB, covers all three sections (Context / Interactive Launch / Sources Footer). Globe rebuilt from scratch on Three.js r160 — no globe.gl dependency. All five documented gotchas handled. SRI hashes on Chart.js and Tailwind v4 CDN loads. Texture hosted locally. Awaiting in-browser user validation.

## What's Built
- `index.html` — full app (Tailwind v4, Chart.js 4.4.1, Three.js r160 ESM)
- `src/data/migration-data.md` — 20 corridors, 8 regional volumes, 9 Chicago citations
- `src/assets/night-earth.jpg` — NASA Black Marble 2016, 13500×6750, 7.7MB
- `docs/globe-rebuild-notes.md` — architecture audit document, 361 lines
- `README.md`, `CLAUDE.md` (project), `.gitignore`

## Next
- User browser validation (open `index.html`, test launch flow, verify arc rendering)
- If issues surface: targeted fix agents
- Stretch: time-slider, sector filters (roadmap v1.1+)
