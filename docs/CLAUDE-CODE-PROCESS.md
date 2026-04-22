# Building Pathways of Labor with Claude Code

## What this is

"Pathways of Labor" is a single-file interactive data portrait (`index.html`) visualizing international labor migration on a Three.js globe. This document records how it was built using Claude Code, the patterns that worked, and the process discipline that kept the project coherent across many iterative sessions.

## Architectural constraints (author-imposed)

- **Single HTML file, no build step.** All logic, markup, and styles in one file. CDN-only dependencies (Three.js r160, Chart.js 4.4.1, Tailwind v4). Portable — opens in any browser, no toolchain.
- **Data as source of truth.** `src/data/migration-data.md` holds all 20 corridors, 8 regional volumes, and 9 Chicago-style citations. Code reads from there; no hardcoded numbers inline.
- **Local assets for critical textures.** NASA Night Earth (7.7MB) hosted locally to avoid CDN drift and offline failures.

## The hard-wired tier rule

The defining discipline of this project: **Opus orchestrates, Sonnet executes.** Codified in the project `CLAUDE.md` as non-negotiable:

- **Opus** handles every planning, architecture, trade-off, and approval decision — the top-level session talking to the author is always Opus.
- **Sonnet** handles every file write, code edit, command run, and mechanical research task — every `Agent` spawn on this project is an explicitly-specified Sonnet subagent.

Rationale: Opus has the reasoning depth for load-bearing architectural calls; Sonnet is fast and cost-efficient for well-scoped execution. The split prevents Opus from burning context on mechanical work and prevents Sonnet from making decisions that need more judgment.

## Workflow shape

Non-trivial work follows four phases:

1. **Explore.** Read relevant code. Understand current state. No changes.
2. **Plan.** Propose an approach, surface trade-offs, wait for approval.
3. **Implement.** Execute the plan via Sonnet subagents. Verify after each step.
4. **Commit.** Concise conventional commits, split logically.

Trivial tasks skip straight to implementation.

## State discipline

Three files carry project memory, each with a distinct role:

- **`.claude/STATUS.md`** — 30-second orientation. What exists now, what's next.
- **`.claude/WORKSTREAMS.md`** — priority tracker. Active, done, blocked, backlog.
- **`docs/PLAYBOOK.md`** — deep workstream memory. Technical decisions, gotchas, root causes, architectural choices. Survives context compression when conversation history doesn't.

Session start: read STATUS + WORKSTREAMS silently, summarize in 2–3 lines, ask what's next.
Session end: update the repo-local files.
At ~40% context usage: mandatory checkpoint — flush all state to the files above.

## Build arc (what actually got built, in order)

### v1 scaffolding
- Repo structure, README with full spec, project `CLAUDE.md` with tier rule
- Research into `globe.gl` (rejected — too opinionated, adopted bespoke Three.js)
- NASA Night Earth texture fetched locally
- Migration data scaffolded: 20 corridors, 8 regions, Chicago citations
- Architecture plan approved (minimal-slice Three.js rebuild)
- `index.html` written: ~1058 lines, 45KB, all three sections (Context / Interactive Launch / Sources Footer)
- SRI hashes on all CDN loads, no `innerHTML` with user-derived data

### Iterative refinement (each bullet = one user round-trip)

1. **Scroll hijack + pie timing.** Decoupled JS animations from instantaneous `revealProgress` by introducing an rAF-driven `animatedReveal`. Pie scale animations now trigger at `r = 0.55` and finish by `r = 0.67`, before the sheet reaches the top.
2. **Full-bleed sheet.** Dropped border-radius and height constraints — sheet fills 100vh.
3. **Country borders.** Amber borders on origin countries (solid) and destination countries (dashed). Upgraded from `THREE.Line` (1px on most GPUs) to `Line2` / `LineMaterial` / `LineGeometry` for true pixel-width rendering (2.5px solid, 3px dashed). Pulse with arcs. Legend swatches added.
4. **Intro cinematic.** Typewriter "How do migrant workers move around the world?" then a horizontal line slides in from the left, a dot replaces a flag, the real `#globeContainer` rolls in from `translateX(-80vw) rotate(0)` to `translateX(0) rotate(720deg)` (normalized to 360°). Slowed to 4500ms so the user can actually watch the roll. Line height computed from FOV/camera/radius so the globe's bottom tangent matches the demo camera geometry.
5. **Stacking context fix.** Intro line invisible despite `z-index: 55` — `#introOverlay` at `z:40` was creating a stacking context that trapped children below `#globeContainer` at `z:50`. Bumped overlay to `z:60`.
6. **Hover/drag decoupling.** Suppress country hover raycasts while the user is dragging or zooming the globe.
7. **Scroll-up lag.** Created timestamped backup (`index.backup-2026-04-20.html`), then optimized: deferred backdrop-filter via `.settled` class at `r ≥ 0.999`, paused Three.js animation loop when sheet is ≥ 95% open, cached `_revealStart` and `_revealSpan` as DOM properties to avoid per-frame `parseFloat`.
8. **Extruded country prisms.** Origin countries had their altitude lifted by outflow score but rendered as floating caps. Added `buildSideWallMesh` helper — walls span `COUNTRY_BASE_ALTITUDE` (0.012) to `topAltitude` (up to 0.092). Opacity 0.95, `depthWrite: true` to prevent the back-wall bleed-through that scuttled the earlier attempt.
9. **Hover suppression on sheet-open.** Tooltip was following the cursor over the pie charts. Added an `#interactive` private flag on the Globe class, gated `#raycast()` on it, and extended `setInteractive(false)` to call `#clearCountryHover()` + `#hideTooltip()` on the disable transition. The reveal controller already flips this the moment `revealProgress` leaves 0.

### Gotchas surfaced and documented

Preserved in `docs/globe-rebuild-notes.md` and `docs/PLAYBOOK.md`:
- Antimeridian-crossing polygon winding (hover ghost regions — backlog item)
- Raycast cost over full mesh list every frame (backlog item: throttle or BVH)
- CSS stacking context traps from `z-index` without explicit `position` layering
- NASA texture color space (must be `SRGBColorSpace` in Three.js r160+)
- earcut winding for GeoJSON ring orientation (outer CCW, holes CW from above)

## Agent spawn pattern

Every file-write on this project has gone through a Sonnet subagent with a briefing that includes:
- Exact file path and line numbers
- The target code block verbatim
- Constraints (don't touch X, don't change Y, single-file only)
- Verification instructions (re-read range, report diff)

A typical prompt reads like a compressed technical design doc — enough context that the subagent can make judgment calls on edge cases without guessing or fabricating.

## Why this discipline

A 1000-line single-file app with CDN-only dependencies sounds simple until it hits 20 iterative rounds of visual refinement. Without the tier split, Opus's context burns down on mechanical string replacements. Without the state files, each session re-derives the project's arc from commit messages. Without the playbook, gotchas get re-discovered and re-fixed every time. The discipline is the load-bearing structure — the HTML file is just the output.

## Change log

Every request updates this file with a new entry below. Most recent at top.

---

**2026-04-21 — Definition swapped to EBSCO source.** Replaced the ILO Convention No. 97 definition with the EBSCO Research Starters phrasing ("an individual who relocates, often temporarily…"), updated the `Source:` attribution, and appended Chicago-style bibliography entry #15. Both `src/data/migration-data.md` and the inline embed in `index.html` updated. Sonnet execution; `src/data/migration-data.md`, `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-21 — Reverted to pre-enhancements backup; hero source reformatted.** Restored `index.html` from `index.backup-2026-04-21-pre-enhancements.html`, rolling back all 9 enhancement-batch changes. Repositioned "Migration Data Portal" citation from below the definition block to directly under "Migrant Workers Worldwide" (above the amber separator), restyled it to match the definition source (uppercase, 0.68rem, letter-spacing 0.14em), and bumped definition quote font-size from 0.98rem to 1.15rem. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-21 — Nine enhancements implemented from adversarial review.** Batch implementation of enhancements 1–8 and 10 from `docs/enhancement_plans.md`, executed in three waves via Sonnet subagents. Wave 1: magic-number extraction (15 named constants), unified `NAME_TO_ISO3` Map with diacritics-stripping normalization (fixed a dest-lookup bug using the origin map), innerHTML→createElement fix on pie tooltip, `.dispose()` hardening on all 5 mesh-replacement paths, raycast throttle at 66ms. Wave 2: `prefers-reduced-motion` respect (CSS overrides + JS intro skip + arc pulse gate), earcut triangulation offloaded to inline Blob Web Worker with sync fallback. Wave 3: pull-tab pointer drag for sheet reveal + wheel dead zone/clamp, full keyboard navigation (arrow-key corridor cycling, Enter to open info, SR announcements via aria-live region, focus ring on globe container). File grew from 2777→3061 lines. Backup: `index.backup-2026-04-21-pre-enhancements.html`. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

**2026-04-21 — Migrant-worker definition in hero block.** New `## Migrant Worker` section in the data markdown (ILO Convention 97, 1949), pulled by the parser and rendered as a serif-italic pull-quote between `Migrant Workers Worldwide` and the Migration Data Portal cite, with a small-caps credit line underneath separated by a faint amber hairline. Data-driven, no hardcoded text in HTML. Sonnet execution; `src/data/migration-data.md`, `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

**2026-04-21 — Post-intro camera pull-back.** New `Globe.zoomOutTo(targetDist, durationMs)` method animates `camera.position.setLength` with eased-out cubic; called from `introFinish` to pull the camera from 300 → 380 over 1.2 s once the roll completes, giving the globe visual breathing room so the overview sheet's pull-up reads as snappier. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

**2026-04-21 — Reverted flow-dots feature.** Restored `index.html` from `index.backup-2026-04-21.html` at user request, rolling back both the initial flow-dots implementation and the subsequent dot-resize tweak. Backup retained in place. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-21 — Flow dots resized + brighter plateau.** Dot radius now scales as `max(1.2, tubeRadius × 1.7)` so heavy-volume corridors (e.g. Yangon→Bangkok) don't swallow their own dots; opacity curve switched to `min(1, sin(t·π) × 1.6)` so dots hold full brightness from t≈0.2 to 0.8 and only fade near the endpoints. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-21 — Flow dots on arcs.** Each migration arc now carries three small white dots that travel origin → destination, evenly phase-offset by 1/3, with `sin(t·π)` opacity so they fade in mid-arc and fade out at the endpoints. The dots reuse the arc's existing Catmull-Rom curve (no extra geometry cost at arc build time), are driven from the Globe animation loop via `curve.getPoint(t, dot.position)` (zero per-frame allocations), and are excluded from raycasting. Pre-change backup: `index.backup-2026-04-21.html`. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-21 — Bottom scroll indicator added.** A subtle gold up-chevron + "Scroll for overview" label now lives at bottom-center of the viewport; fades in after the intro sequence (same `.ready` hook as `#gdpLegend`) and fades out as the sheet is pulled up, using the existing `--reveal` CSS var (now set on `:root` so non-sheet descendants can read it). Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-21 — Intro animation smoothed; no more pop-in.** Globe container now starts fully off-screen at `-115vw` with opacity permanently at 1 (dropped the 420ms opacity fade that was causing the pop-in), and both the globe transform and the question text now share a symmetric `cubic-bezier(.4, 0, .2, 1)` over 4800ms for a deliberate, synchronized slide. Sonnet execution; `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-20 — Bibliography expanded; hero number refreshed.** Updated global migrant workers figure from 169M (ILO 2019) to 167.7M (Migration Data Portal); added MDP Chicago citation + World Bank API entry to bibliography (14 total); hero-cite and count-up animation updated to match. Sonnet execution; `src/data/migration-data.md`, `index.html`, `docs/CLAUDE-CODE-PROCESS.md` touched.

---

**2026-04-20 — Pie-chart label redesign.** Replaced the cramped internal labels (truncated with `…`, stretched via `textLength`) with external labels on a radial leader tick. Each slice ≥ 1.5% now shows the full, untruncated country name in weight-600 slate-100, with a weight-400 slate-400 percentage on a second line. SVG viewBox expanded from `-110 -110 220 220` to `-160 -160 320 320` to give the labels room, text anchored `start` / `end` based on the slice's midAngle so nothing crosses the pie center.

---

**2026-04-20 — Three accuracy fixes.** (1) GDP year alignment: the inline fallback `GDP_PER_CAPITA` object was WB 2024 data despite the API URL, legend, and SOURCES citation all claiming 2022 — updated API `date=2024`, legend `(2024)`, SOURCES key renamed `WB-GDP-2022 → WB-GDP-2024`, comment block and citation text matched. (2) `resolveSource` default changed from `'ILO-EST'` to `null` so unmatched/misspelled source strings no longer silently misattribute to ILO; all downstream consumers already handle the missing-id case cleanly. (3) Hero stat cite now reads "ILO Global Estimates on International Migrant Workers (2019 Data, Published 2021)" to separate the reference year from the publication year.

---

**2026-04-20 — Self-contained single-file build.** Inlined `countries-110m.geojson` (~820 KB), `migration-data.md` (~6 KB), and `night-earth-web.jpg` (~2.6 MB, base64-encoded to ~3.5 MB) directly into `index.html` via three `<script>` containers. Replaced the three local `fetch()` calls with DOM reads from those containers, removed the `file://` hard-fail guard, and pointed the texture loader at the embedded data URI. Final HTML is ~4–5 MB but truly double-click-able — no server, no asset folder required.

---

**2026-04-20 — Worldometers changes reverted.** Restored GDP-per-capita dataset to World Bank 2022 with full decimal precision (158 countries), re-enabled the `fetchWorldBankGDP` live API fallback, restored the `_gdpLive` flag, renamed the `SOURCES` registry key back to `WB-GDP-2022`, reset legend title / max label / `gdpToColor` upper bound to their original values, and dropped the Worldometers entry from the bibliography while keeping the NASA / Natural Earth / REST Countries entries (renumbered 10–12). Net state: identical to pre-Worldometers build except for the three preserved bibliography additions.

**2026-04-20 — Bibliography completeness pass.** Appended Worldometers, NASA Earth at Night, Natural Earth, and REST Countries API v3.1 to the overview-sheet bibliography in `src/data/migration-data.md` (entries 10–13). Chicago style for the three data sources; informal one-line reference for the API per author preference. Brings the displayed Sources list into 1:1 alignment with everything the app actually loads.

**2026-04-20 — Document created.** This file written to capture the Claude Code process behind the portrait. Going forward, every subsequent request appends one entry here summarizing the change.

**2026-04-20 — Hover suppression when sheet is up.** Added `#interactive` private flag on the Globe class; `setInteractive(false)` now clears hover and hides tooltip; the per-frame raycast call is gated on the flag. Three surgical edits, all via Sonnet.

**2026-04-20 — Vertical walls on elevated countries.** New `buildSideWallMesh` helper extrudes origin countries from base to top altitude as proper prisms. `depthWrite: true`, opacity 0.95 to avoid back-wall bleed-through that defeated the earlier attempt.
