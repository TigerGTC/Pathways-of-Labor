# Workstreams

## Active
None — awaiting user validation of v1 build.

## Done (v1)
- [x] Repo structure scaffolded
- [x] README written with full spec
- [x] Project CLAUDE.md — Opus-orchestrates / Sonnet-executes hard rule
- [x] globe.gl component extract (research-only, no adoption)
- [x] Architecture plan approved (minimal-slice rebuild on Three.js)
- [x] NASA Night Earth texture fetched + hosted locally
- [x] Migration data scaffolded (20 corridors, 8 regions, Chicago citations)
- [x] Globe rebuild notes doc (five gotchas, audit trail)
- [x] index.html built — single file, all three sections, all gotchas handled
- [x] Security hygiene verified (SRI, CSP, no innerHTML with data, local texture)

## Blocked
None.

## Backlog (post-validation)
- **Bug — phantom country hover regions**: some hover-active country polygons appear in random locations on the globe. All real countries render in the correct places, but extra/ghost hover zones show up elsewhere. Suspect stale/duplicated geometry, incorrect vertex winding on antimeridian-crossing polygons, or raycast picking a back-face mesh. Investigate topology source + raycast layer filter.
- **Perf — hover lag during drag**: frame stutters when raycasting arcs/countries while user is rotating the globe. Likely raycast cost over full mesh list every frame. Candidates: throttle raycasts to N per second, use a BVH (`three-mesh-bvh`), or skip raycasts while `controls` is actively dragging. Investigate once feature set stabilizes.
- v1.1 — time-slider for multi-year corridor evolution
- v1.2 — sector filters (domestic work, construction, agriculture, care)
- v1.3 — remittance overlay toggle
