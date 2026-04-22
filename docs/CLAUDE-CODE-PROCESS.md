# Building "Pathways of Labor" with Claude Code

## What this document is

This is the full story of how "Pathways of Labor" — an interactive data portrait visualizing international labor migration on a 3D globe — was built entirely through collaboration between a human author (Geoffrey / Larabi) and Claude Code (Anthropic's AI coding assistant). It covers how the project started, the iterative process of building it across multiple sessions, how visual and architectural decisions were made, and the discipline that kept it coherent across dozens of rounds of refinement.

---

## How it started

The project began as a class assignment: create a "data portrait" — a visualization that tells a human story through data. Geoffrey chose international labor migration because the data carries real weight: 167.7 million migrant workers worldwide, moving along corridors shaped by wage gaps, colonial history, and economic gravity.

### The research phase

Before any code was written, Geoffrey compiled a research document (`docs/Research Data for Data Portrait.md`) drawing from ILO global estimates, UN DESA migrant stock data, World Bank remittance flows, and IMF GDP per capita figures. This wasn't just data gathering — it was framing the narrative. The research identified the key corridors (Philippines → Saudi Arabia, Bangladesh → UAE, Mexico → USA, etc.), the economic drivers (the wage gap as the primary force), and the human systems behind the numbers (the GCC Kafala sponsorship system, private recruitment agencies, specific visa classes).

The bibliography was built in Chicago style from the start — ILO, UN DESA, World Bank/KNOMAD, IMF, BBVA Research, IOM — establishing an academic rigor that would carry through to the final product.

### The initial vision

Geoffrey's concept was ambitious: not a flat chart or a static map, but an interactive 3D globe where migration corridors arc across the surface, countries light up based on economic data, and the viewer can explore the data spatially. The question that would eventually become the intro animation's typewriter text — "How do migrant workers move around the world?" — was the driving design question from day one.

---

## The Claude Code workflow

### The two-tier model rule

The most distinctive aspect of this build was a strict model separation rule, codified in the project's `CLAUDE.md` as non-negotiable:

- **Opus** (the more capable reasoning model) handles all orchestration: planning, architecture, trade-off analysis, design decisions, debugging strategy, and approval gates.
- **Sonnet** (the faster execution model) handles all implementation: every file write, code edit, command execution, and mechanical task is delegated to a Sonnet subagent.

This wasn't arbitrary. The rationale was practical: Opus has superior reasoning for architectural judgment and adversarial analysis, but burns context quickly on mechanical work. Sonnet is fast, cost-efficient, and reliable for well-scoped execution. The clean separation meant Opus could focus on *what* to build and *why*, while Sonnet focused on *how* — with explicit briefings that included exact file paths, line numbers, target code blocks, and constraints.

Every Sonnet subagent spawn followed a pattern: the prompt read like a compressed technical design doc, with enough context that the subagent could make judgment calls on edge cases without guessing or fabricating. This pattern held across every single file-write in the project.

### The four-phase workflow

Non-trivial work followed a consistent cycle:

1. **Explore** — Read relevant code, understand current state. No changes yet.
2. **Plan** — Propose an approach, surface trade-offs, get Geoffrey's approval. No implementation.
3. **Implement** — Execute the plan via Sonnet subagents, with verification after each step.
4. **Commit** — Concise conventional commits (`feat:`, `fix:`, `chore:`, `docs:`), split logically.

Trivial tasks (small text changes, single-line fixes) skipped straight to implementation. The judgment of what was "trivial" was itself an Opus-level decision.

### State discipline across sessions

Three files carried project memory across Claude Code sessions, each with a distinct role:

- **`.claude/STATUS.md`** — 30-second orientation. What exists now, what's next.
- **`.claude/WORKSTREAMS.md`** — Priority tracker. Active, done, blocked, backlog.
- **`docs/PLAYBOOK.md`** — Deep workstream memory. Technical decisions, gotchas, root causes, architectural choices.

At the start of every session, Claude Code would read STATUS and WORKSTREAMS silently, summarize the current state in 2–3 lines, and ask what's next. At the end, the repo-local files were updated. At ~40% context usage in long sessions, a mandatory checkpoint flushed all state to these files.

This discipline was critical because Claude Code sessions don't share memory by default — each conversation starts fresh. Without these files, each session would re-derive the project's entire arc from commit messages and code reading. The state files meant Geoffrey could pick up exactly where he left off, every time.

---

## The build arc: from v1 to final product

### Phase 1: Research and scaffolding

The first phase was pure research and planning. Geoffrey compiled migration statistics, identified data sources, and worked with Claude Code to evaluate visualization approaches. The key architectural decision came early:

**globe.gl was evaluated and rejected.** The rationale (documented in `docs/globe-rebuild-notes.md`) was thorough: globe.gl pulls in ~12 transitive dependencies, none of which can be quickly audited. For a visualization handling real labor-route data, minimizing third-party runtime code was a first-class constraint. The required feature slice — sphere with texture, orbit controls, atmosphere glow, point markers, arc animations, raycaster tooltip — landed at ~325 lines of application code. "Write it ourselves and own it fully" beat "accept a large opaque dependency."

This decision shaped everything that followed: bespoke Three.js code, hand-rolled geometry, inlined d3-geo interpolation (~10 lines replacing the entire d3 dependency), and a security posture where every line running in the visitor's browser could be traced to a deliberate decision.

### Phase 2: The v1 single-file build (1,058 lines)

The initial implementation was a single HTML file — all logic, markup, and styles in one place. CDN-only dependencies (Three.js r160, Chart.js 4.4.1 for bar charts, Tailwind v4 for utility CSS). The constraints were author-imposed:

- **No build step.** Portable — opens in any browser, no toolchain.
- **Data as source of truth.** `src/data/migration-data.md` holds all 20 corridors, 8 regional volumes, and citations. Code reads from there; no hardcoded numbers inline.
- **Local assets for critical textures.** NASA Night Earth (7.7 MB) hosted locally to avoid CDN drift and offline failures.
- **SRI hashes on all CDN loads.** No `innerHTML` with user-derived data. Security was baked in from the start, not bolted on.

The v1 had a working globe with textured sphere, amber migration arcs, city-point markers, orbit controls, and a three-section layout (Context / Interactive Globe / Sources Footer). Chart.js rendered regional volume bar charts.

### Phase 3: Iterative visual refinement (20+ rounds)

This is where the project transformed from functional to polished. Each round was a single user request → Claude Code response cycle, and each one is logged in the change log below. The key visual decisions, in roughly chronological order:

**The scroll-reveal sheet.** Geoffrey wanted the overview data to feel like pulling up a drawer, not clicking a button. This led to the wheel-hijack interaction: scrolling down at max zoom-out pulls up a full-viewport sheet with statistics and charts. This required decoupling JS animations from instantaneous scroll position by introducing an rAF-driven `animatedReveal` value — one of the project's most complex pieces of interaction code, refined across multiple iterations.

**Pie charts replaced bar charts.** Chart.js bar charts were replaced with hand-drawn SVG pie charts for top destination and outflow countries. The labels went through their own iteration: internal labels were cramped and truncated, so they were redesigned as external labels on radial leader ticks with the full country name untruncated.

**Country borders and elevation.** Origin countries got solid amber borders; destination countries got dashed borders. The initial THREE.Line implementation rendered at 1px on most GPUs regardless of settings — this was replaced with Line2/LineMaterial/LineGeometry for true pixel-width rendering (2.5px solid, 3px dashed). Later, the solid/dashed mapping was swapped (dashed for outflow, solid for destination) based on Geoffrey's visual preference.

Origin countries were then given elevation — extruded upward based on outflow score, creating 3D prisms that make labor-exporting nations literally stand out. The first attempt had floating caps; the fix was a `buildSideWallMesh` helper that extrudes proper walls from base to top altitude, with `depthWrite: true` and opacity 0.95 to prevent back-wall bleed-through.

**The intro cinematic.** This went through the most iterations of any single feature. The sequence: a typewriter types "How do migrant workers move around the world?", a horizontal line slides in from the left, and the globe rolls in from off-screen. The globe's entry animation went from `translateX(-80vw) rotate(720deg)` (later normalized to 360°) to a synchronized slide with the text. The initial version had a jarring pop-in from an opacity fade — this was replaced with the globe starting fully off-screen at `-115vw` with permanent opacity 1, sharing a symmetric easing curve with the text over 4800ms. After the intro, a post-intro camera pull-back (300 → 380 units over 1.2s) gives the globe breathing room.

**Flow dots on arcs.** Small white dots traveling along migration arcs were added, then resized (they were swallowing heavy-volume corridors), then removed entirely at Geoffrey's direction. The backup/revert discipline meant this was a clean rollback, not a messy undo.

**The scroll hint indicator.** A subtle gold up-chevron with "Scroll for overview" at the bottom of the viewport, fading in after the intro and fading out as the sheet rises. Later enhanced with click-to-open and drag-to-open interactions (and corresponding drag-to-close on the sheet handle), giving the sheet a native bottom-sheet feel.

**The migrant worker definition.** A pull-quote in the hero section, data-driven from the markdown source. Went through multiple iterations: started with the ILO Convention No. 97 (1949) definition, then swapped to the EBSCO Research Starters phrasing. Later, "Outflow Country" and "Destination Country" definitions were added underneath, then shortened to single sentences without quotes (since they weren't sourced from a specific citation).

**GDP color legend.** Countries colored by GDP per capita (World Bank data), with a color ramp from deep blue (low) through green to warm amber (high). The GDP data went through its own accuracy pass: the inline fallback was WB 2024 data but the legend claimed 2022 — this was caught and aligned. The hero stat source was updated to distinguish reference year from publication year.

### Phase 4: The self-contained experiment and its reversal

At one point, Geoffrey had the entire project inlined into a single HTML file: the GeoJSON (~820 KB), migration data (~6 KB), and the Night Earth texture (~2.6 MB, base64-encoded to ~3.5 MB) — all embedded as `<script>` containers. The three `fetch()` calls were replaced with DOM reads. The result was a 4.6 MB HTML file that was truly double-clickable — no server, no asset folder. This was the logical extreme of the "single file, no build step" constraint.

The backup files tell this story: `index.backup-2026-04-20.html` (105 KB, pre-inline), `index.backup-2026-04-21.html` (4.6 MB, with inlined assets), `index.backup-2026-04-21-pre-enhancements.html` (4.6 MB, pre-enhancement-batch).

### Phase 5: The adversarial review and enhancement batch

Two independent adversarial reviews of the codebase were conducted, producing `docs/enhancement_plans.md` — a force-ranked list of 10 enhancements. Several review findings were rejected as false positives (e.g., "missing functions / app non-functional" — the reviewer saw a partial view of a 4000+ line file; "externalize data / decompose via bundler" — contradicts the author-imposed constraints).

Nine enhancements were implemented in a single batch across three waves:
- **Wave 1:** Magic-number extraction (15 named constants), unified name-to-ISO3 Map with diacritics-stripping normalization, innerHTML→createElement security fix on pie tooltip, `.dispose()` hardening on all 5 mesh-replacement paths, raycast throttle at 66ms.
- **Wave 2:** `prefers-reduced-motion` respect (CSS overrides + JS intro skip + arc pulse gate), earcut triangulation offloaded to inline Blob Web Worker with sync fallback.
- **Wave 3:** Pull-tab pointer drag for sheet reveal, full keyboard navigation (arrow-key corridor cycling, Enter to open info, screen reader announcements via aria-live region, focus ring on globe container).

The file grew from 2,777 to 3,061 lines. Then, based on Geoffrey's assessment of the result, the entire batch was reverted to the pre-enhancement backup — a clean rollback that demonstrated the value of the timestamped backup discipline.

### Phase 6: Restructuring to a standard static site

The final architectural move: breaking the single HTML file into a proper static site structure for Vercel deployment:
- `index.html` — slim 118-line shell with markup only
- `js/app.js` — 2,283 lines of application logic
- `css/styles.css` — 382 lines of styles
- `data/migration-data.txt` — the data source
- `data/countries-110m.json` — GeoJSON
- `assets/` — textures

This restructuring also surfaced a cross-browser compatibility bug: the importmap-based Three.js loading worked in modern Chrome but failed silently in Safari < 16.4 and Firefox < 108. The fix was adding the `es-module-shims` polyfill — diagnosed by tracing the symptom (blinking CSS cursor, no JS execution) back to the root cause (bare specifier `'three'` used internally by Three.js addon modules, unresolvable without importmap support).

---

## Visual design decisions and their rationale

Every visual choice in this project was Geoffrey's. Claude Code proposed options and trade-offs; Geoffrey chose. The key decisions:

- **Amber as the primary accent color** (`#fbbf24`) — warm, high-contrast against the dark globe, evocative of labor and warmth without being aggressive. Used for arcs, borders, legends, UI chrome, and the scroll hint.
- **NASA Night Earth texture** — shows the world as interconnected points of light, not political boundaries. The visual metaphor: migration follows economic gravity, and economic activity concentrates where the lights are.
- **Dark background with glassmorphic overlay** — the sheet uses `backdrop-filter: blur(14px)` with semi-transparent dark gradients. Academic tone without being sterile.
- **Georgia serif italic for definitions** — pull-quotes use a serif font at 1.35rem, establishing a typographic hierarchy that signals "this is a cited definition" without needing explicit framing.
- **Uppercase small-caps for metadata** — source citations, legend labels, and the scroll hint use 0.68rem uppercase with wide letter-spacing. Subtle, readable, doesn't compete with the data.
- **The globe entry animation** — the roll-in from off-screen was a deliberate choice to make the globe feel like a physical object entering the frame, not a digital element appearing. The 4800ms duration was tuned to feel deliberate without being slow.
- **Dashed vs. solid borders** — dashed for outflow (origin) countries, solid for destination countries. The visual logic: dashed lines suggest departure/openness; solid lines suggest arrival/containment.
- **3D extrusion on origin countries** — countries that export labor literally rise from the surface, proportional to their outflow score. This makes the data physically legible — you can see at a glance which nations are the major labor exporters.

---

## What worked about this process

### The tier split prevented context burnout
Opus never wrote a single line of code to a file. Every mechanical operation went through Sonnet. This meant Opus's context window stayed focused on architecture, trade-offs, and decision-making — the things that actually benefit from deeper reasoning. In a project with 20+ iterative rounds, this discipline is what kept sessions productive instead of degrading.

### Backups enabled fearless iteration
Timestamped backups before risky changes (`index.backup-2026-04-20.html`, `index.backup-2026-04-21.html`, `index.backup-2026-04-21-pre-enhancements.html`) meant Geoffrey could say "revert everything" at any point and get a clean rollback. This encouraged experimentation — features like flow dots were tried, evaluated, and cleanly removed when they didn't serve the visualization.

### The state files enabled multi-session coherence
STATUS.md, WORKSTREAMS.md, and the PLAYBOOK meant each new Claude Code session started with full context, not a cold start. The process doc itself (this file) became part of that memory — a living record that new sessions could read to understand not just *what* existed, but *why* and *how* it got there.

### Adversarial review caught real issues
The enhancement review identified genuine gaps (keyboard navigation, screen reader support, `.dispose()` leaks, innerHTML XSS surface) that iterative development had missed. Even though the batch implementation was reverted, the findings informed later targeted fixes.

### The subagent briefing pattern produced reliable execution
By giving Sonnet subagents explicit file paths, line numbers, verbatim code blocks, and constraints, the execution was consistently accurate. The pattern — brief the agent like a colleague who just walked in — minimized hallucination and maximized first-attempt success.

---

## The numbers

- **Sessions:** 10+ Claude Code conversations across 3 days
- **Iterative rounds:** 25+ request-response cycles with code changes
- **v1 size:** 1,058 lines (single HTML file)
- **Peak size:** ~3,061 lines / 4.6 MB (single file with inlined assets)
- **Final size:** 2,783 lines across 3 files (118 HTML + 2,283 JS + 382 CSS)
- **Data sources:** ILO, UN DESA, World Bank, POEA, BMET, DoFE Nepal, SLBFE, Eurostat, GCC-Stat, Migration Data Portal, NASA, Natural Earth, REST Countries API, EBSCO
- **Migration corridors visualized:** 20
- **Regional volumes tracked:** 8
- **Bibliography entries:** 16 (Chicago style)
- **Backups created:** 4 (timestamped, pre-change snapshots)
- **Features tried and reverted:** 2 (flow dots, 9-enhancement batch)
- **Cross-browser bugs diagnosed:** 1 (importmap compatibility — fixed with es-module-shims polyfill)

---

## Change log

Every request that changes code appends an entry here. Most recent at top.

---

**2026-04-22 — Click and drag interactions for overview sheet.** Added click-to-open on the scroll hint indicator and drag-to-open (pointer events with snap-on-release). Same pattern inverted on the sheet handle chevron: click-to-close and drag-to-close. Sheet handle enlarged with grab cursor and touch-action support. Sonnet execution; `js/app.js`, `css/styles.css` touched.

**2026-04-22 — Swapped border line styles.** Dashed borders now mark outflow (origin) countries, solid borders mark destination countries. Updated both the rendering logic in `setCountryBorders` and the legend swatches in `index.html`. Sonnet execution; `js/app.js`, `index.html` touched.

**2026-04-22 — Cross-browser fix: es-module-shims polyfill.** Diagnosed blank page on non-local browsers — importmap not supported in older Safari/Firefox, causing entire JS module to fail silently (only CSS cursor blink visible). Restored importmap (required for Three.js internal bare specifier resolution) and added es-module-shims v1.10.1 as a polyfill. Sonnet execution; `index.html`, `js/app.js` touched.

**2026-04-22 — Shortened outflow/destination definitions.** Reduced definitions to single sentences ("A nation from which workers emigrate to seek employment abroad." / "A nation that receives migrant workers.") and removed quotation marks since these are not sourced citations. Sonnet execution; `src/data/migration-data.md`, `data/migration-data.txt`, `js/app.js` touched.

**2026-04-22 — Added outflow and destination country definitions.** New definition blocks for "Outflow Country" and "Destination Country" in the overview sheet hero section, parsed from the data markdown and rendered with label headers matching existing typography. Sonnet execution; `src/data/migration-data.md`, `data/migration-data.txt`, `index.html`, `js/app.js`, `css/styles.css` touched.

**2026-04-22 — Added Migration Data Portal (2022) citation.** Appended Chicago-style bibliography entry #16 for the Migration Data Portal "Labour Migration Statistics" (2022) source. Sonnet execution; `src/data/migration-data.md`, `data/migration-data.txt` touched.

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
