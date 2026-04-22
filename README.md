# Pathways of Labor: A Global Data Portrait

> A single-file, research-grade web application that turns global migrant-labor statistics into an interactive 3D portrait — part data journalism, part academic brief, part atlas.

Built to demonstrate that rigor and design are not opposites: every arc on the globe is sourced, every citation is Chicago-formatted, and every visual decision is defensible.

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Features](#features)
- [Sections](#sections)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Browser Requirements](#browser-requirements)
- [Accessibility & Performance](#accessibility--performance)
- [Methodology & Sources](#methodology--sources)
- [Roadmap](#roadmap)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Why This Exists

Global migrant labor is one of the most consequential — and least visualized — forces shaping the modern economy. Official statistics are scattered across ILO tables, UN DESA spreadsheets, and World Bank dashboards. This project consolidates them into a single, pedagogically useful portrait aimed at students, researchers, and policy curious readers.

## Features

- **Zero-install deployment** — static files, CDN-only dependencies, any web server
- **Interactive 3D globe** — Night Earth texture with glowing amber migration arcs
- **Academic data framing** — ILO/UN definition, regional breakdowns, open inquiry questions
- **Chicago-style citations** — every figure traceable to a primary source
- **Media literacy note** — explicit corroboration methodology, not opaque "trust me" data
- **Responsive layout** — Tailwind-driven, works across desktop and tablet

## Sections

### 1. The Context
- **Definition block** — ILO/UN-standard definition of "Migrant Worker"
- **Two-column research panel**
  - Left: the *how* of migration — legal frameworks, bilateral agreements, recruitment agencies, kafala systems
  - Right: Chart.js bar/pie chart — global migration volumes by region
- **Inquiry section** — 3–4 open-ended questions about the future of migrant labor (automation, climate displacement, remittance economies, rights portability)

### 2. The Interactive Launch
- Full-width hero with a **"Launch 3D Flow Visualization"** call-to-action
- On click: research panel hides → Globe.gl initializes full-screen
- **Night Earth** texture with **glowing amber arcs** rendering corridor flows
- Hover interactions reveal origin → destination volume and primary sectors

### 3. Sources Footer (Chicago Style)
- All citations in Chicago Author-Date format
- **Media Literacy Note** explaining source-corroboration methodology

Example citation format:

> International Labour Organization. *ILO Global Estimates on International Migrant Workers: Results and Methodology*. 3rd ed. Geneva: ILO Publications, 2021. https://www.ilo.org/publications.

## Tech Stack

| Library | Purpose | Delivery |
|---|---|---|
| Tailwind CSS (v3) | Utility-first styling | CDN |
| Chart.js (v4) | 2D statistical charts | CDN |
| Globe.gl | Interactive 3D globe | CDN |
| Three.js | Globe.gl peer dependency | CDN |

No bundler, no package manager, no build step. Requires any HTTP server (no `file://` support).

## Project Structure

```
Globe/
├── index.html                  # HTML shell — markup + script/link refs
├── css/
│   └── styles.css              # All application styles
├── js/
│   ├── error-handler.js        # Global error surface (non-module)
│   └── app.js                  # Main Three.js application (ESM)
├── data/
│   ├── countries-110m.json     # Natural Earth 110m GeoJSON (177 features)
│   └── migration-data.txt      # Corridor data, regional volumes, sources
├── assets/
│   └── night-earth-web.jpg     # NASA Black Marble texture (optimized)
├── src/
│   ├── data/
│   │   ├── migration-data.md   # Source data: coordinates, volumes, citations
│   │   └── countries-110m.geojson  # Original GeoJSON source
│   └── assets/
│       └── night-earth-web.jpg # Full-res source texture
├── docs/
│   └── PLAYBOOK.md             # Technical decisions, data gotchas, architecture
├── README.md
├── CLAUDE.md
├── .gitignore
└── .claude/
    ├── STATUS.md               # 30-second orientation
    └── WORKSTREAMS.md          # Priority tracker
```

## Data Model

`src/data/migration-data.md` is the single source of truth. At page load, the app parses it to populate both Chart.js datasets and Globe.gl arcs.

**Expected schema (excerpt):**

```markdown
## Corridors
| Origin City | Origin Lat | Origin Lng | Dest City | Dest Lat | Dest Lng | Volume | Year | Source |
|---|---|---|---|---|---|---|---|---|
| Manila | 14.5995 | 120.9842 | Riyadh | 24.7136 | 46.6753 | 850000 | 2023 | ILO |

## Regional Volumes
| Region | Migrant Workers (millions) | Year |
|---|---|---|
| Gulf States | 23.8 | 2022 |
| North America | 26.5 | 2022 |
```

Arcs render from `(Origin Lat, Origin Lng)` → `(Dest Lat, Dest Lng)` with thickness scaled to `Volume`.

## Getting Started

No build step. Serve the project root with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

> **Note:** Opening `index.html` directly via `file://` will not work due to browser CORS restrictions on `fetch()`. Use any HTTP server — the project has zero dependencies to install.

## Browser Requirements

- **WebGL 2.0** — required by Globe.gl (verify at [webglreport.com](https://webglreport.com))
- **Modern evergreen browser** — Chrome 90+, Firefox 88+, Safari 15+, Edge 90+
- **Hardware acceleration enabled** — globe will degrade gracefully to a static image if unavailable
- **Network access** — CDN dependencies load on first paint; no offline fallback in v1

## Accessibility & Performance

- Semantic HTML5 landmarks (`<header>`, `<main>`, `<section>`, `<footer>`)
- Chart.js canvases include ARIA labels and a visually-hidden data table fallback
- Globe container exposes a "skip visualization" link for keyboard and screen-reader users
- First Contentful Paint target: **< 1.5s** on broadband
- Globe initialization is lazy — deferred until the user clicks *Launch*, keeping initial load light

## Methodology & Sources

Every figure is corroborated against at least **two independent primary sources** before inclusion. Where sources disagree materially, the discrepancy is surfaced in-line rather than silently averaged. Primary sources:

- **International Labour Organization (ILO)** — labor-specific migrant counts
- **UN DESA** — International Migrant Stock dataset (city/country coordinates)
- **World Bank** — remittance corridors and volumes

See `docs/PLAYBOOK.md` for the full source hierarchy and corroboration protocol.

## Roadmap

- [ ] v1.0 — Static data bundle, single-file deployment
- [ ] v1.1 — Time-slider for multi-year corridor evolution
- [ ] v1.2 — Sector filters (domestic work, construction, agriculture, care)
- [ ] v1.3 — Remittance overlay toggle
- [ ] v2.0 — Optional backend for live ILO API pulls

## Acknowledgments

Data made available through the public datasets of the **International Labour Organization**, **UN Department of Economic and Social Affairs**, and the **World Bank**. Globe texture courtesy of **NASA Visible Earth** (Blue Marble / Earth at Night, public domain).

## License

Educational use. Source data retains its original publisher license; visualization code is released under MIT.
