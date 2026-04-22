# Playbook — Pathways of Labor

## Architecture Decision: Single .html File
All logic, styles, and markup in one file. CDN-only dependencies. No build step.
Rationale: maximum portability, zero setup friction, educational deployment target.

## Globe.gl Integration Notes
- Globe.gl requires Three.js as a peer dep — load Three.js before Globe.gl via CDN
- Night Earth texture: use NASA Blue Marble night image (public domain)
- Arc data format: `{ startLat, startLng, endLat, endLng, color, altitude }`
- Amber arcs: `color: 'rgba(255, 180, 50, 0.8)'`, `altitude: 0.3`

## Chart.js Notes
- Use `type: 'bar'` for regional volume comparison
- Color palette: match academic tone — muted blues, warm accent for highlight regions

## Data Source Hierarchy
1. ILO — primary for labor-specific migration counts
2. UN DESA — International Migrant Stock dataset (city/country coordinates)
3. World Bank — remittance flows (supplementary)

## Chicago Citation Format
`Lastname, Firstname. *Title*. Publisher, Year. URL.`
