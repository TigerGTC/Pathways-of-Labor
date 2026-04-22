# Enhancement Plans — Pathways of Labor

Force-ranked enhancements derived from two independent adversarial reviews of `index.html`, filtered against the project's architectural constraints (single HTML file, no build step, CDN-only dependencies, `file://`-openable).

**Date:** 2026-04-21

---

## Rejected / False Positives

These items from the reviews were evaluated and discarded:

- **"Missing functions / app non-functional"** — False positive. Reviewer saw a partial view of a 4000+ line file. All referenced functions (`loadMigrationData()`, `fetchWorldBankGDP()`, `SOURCES`, `GDP_PER_CAPITA`, etc.) are defined. App has been through 9 iterative refinements with in-browser validation.
- **"Externalize data / decompose via bundler"** — Contradicts the author-imposed single-file, no-build-step, `file://`-openable constraint. The inline data *is* the supply-chain mitigation.
- **"4.6MB supply-chain nightmare"** — Inverted reasoning. Inline data under version control with no external fetch is the opposite of a supply-chain risk.
- **"LOD / frustum culling / instanced rendering"** — Over-engineering for 20 corridors and ~170 country meshes from a 110m dataset. This is a data portrait, not Google Earth.

---

## Tier 1 — High Impact, Feasible Within Constraints

### 1. Globe Keyboard Navigation + Screen Reader Support
**Sources:** Both reviews  
**Effort:** Medium  
**Impact:** Critical  

The canvas globe is a black box to assistive technology. This is the single highest-impact gap — it affects whether entire user populations can engage with the piece at all.

**Scope:**
- Arrow-key camera snapping to top corridors
- `aria-live` region piped from raycast hits
- Focus management between globe and overlay panels
- All JS event handlers and ARIA attributes — no build step needed

### 2. `prefers-reduced-motion` Respect
**Sources:** Review 1  
**Effort:** Low  
**Impact:** High  

The intro cinematic, globe roll, rAF arc animations, and scroll transitions all run unconditionally. One media query check at init + conditional class gating addresses this with minimal code.

### 3. Scroll / Wheel Interaction Redesign
**Sources:** Review 1  
**Effort:** Medium  
**Impact:** High  

The wheel hijack is brittle on trackpad/mobile/high-DPI. Has already required multiple iterations (change log items 1, 7). The interaction model fights native scroll on touch devices.

**Options:**
- **(a) Drag handle + CSS transform** — simplest, most robust
- **(b) Gesture detection** — distinguish intentional sheet-pull from scroll-through
- **(c) Button-triggered sheet** with CSS transition

Option (a) recommended.

### 4. WebGL `.dispose()` Audit
**Sources:** Review 2  
**Effort:** Low  
**Impact:** High (silent failure)  

If `setCountries` or arc rebuild paths don't call `.dispose()` on replaced `BufferGeometry` / `Material` / `LineMaterial`, VRAM leaks accumulate. JS garbage collection does not free GPU memory. Requires a line-by-line audit of every mesh replacement path.

---

## Tier 2 — Meaningful Improvement, Moderate Effort

### 5. `innerHTML` Security Audit
**Sources:** Review 1  
**Effort:** Low  
**Impact:** Medium-High  

Review 1 claims some `innerHTML` assignments survive in pie tooltips and error panels. If true, this is a real XSS surface — the `textContent` discipline is documented but may have gaps in code added during iterative refinements. Quick grep and fix if found.

### 6. Earcut Triangulation Offload to Web Worker
**Sources:** Review 2  
**Effort:** Medium  
**Impact:** Medium  

Synchronous earcut pass on ~170 Natural Earth polygons blocks the main thread during cold start. A Web Worker returning `Float32Array` buffers is feasible in a single HTML file via inline `Blob` URL worker. Directly improves Time to Interactive.

### 7. Raycasting Throttle / Drag Suppression
**Sources:** Both reviews (also in project backlog)  
**Effort:** Low  
**Impact:** Medium  

Skip all raycasts while `OrbitControls` is actively dragging (partially implemented per change log item 6). Throttle raycasts to 10–15/sec during idle hover. No BVH needed at this dataset scale.

### 8. Country Name → ISO3 Normalization via `Map`
**Sources:** Review 1  
**Effort:** Low  
**Impact:** Medium  

Replace `ORIGIN_NAME_TO_ISO3` / `DEST_NAME_TO_ISO3` string-key objects with a canonical `Map<normalizedName, iso3>` that strips diacritics and lowercases. Prevents silent data drops on name mismatches.

---

## Tier 3 — Valid but Constrained by Architecture

### 9. Drop Tailwind CDN (Eliminate `'unsafe-inline'` CSP)
**Sources:** Both reviews  
**Effort:** High  
**Impact:** Medium  

`@tailwindcss/browser` play CDN forces `'unsafe-inline'` in CSP for styles. The fix (pre-compiled stylesheet) requires either a build step or hand-writing all utility CSS. Realistic path within single-file constraint: extract only the used utility classes into a `<style>` block and drop Tailwind entirely. Eliminates a runtime dependency and tightens CSP.

### 10. Magic Number Extraction to Named Constants
**Sources:** Review 1  
**Effort:** Low  
**Impact:** Low  

`dy / 320`, `0.15`, `0.999`, animation timings — these should be named constants at the top of the script block. Doesn't change behavior, improves readability and future tuning.

---

## Summary Matrix

| Rank | Enhancement | Source | Effort | Impact | Constraint-Safe |
|------|------------|--------|--------|--------|-----------------|
| 1 | Globe keyboard nav + ARIA | Both | Medium | Critical | Yes |
| 2 | `prefers-reduced-motion` | R1 | Low | High | Yes |
| 3 | Scroll interaction redesign | R1 | Medium | High | Yes |
| 4 | WebGL `.dispose()` audit | R2 | Low | High (silent) | Yes |
| 5 | `innerHTML` audit | R1 | Low | Medium-High | Yes |
| 6 | Earcut → Web Worker | R2 | Medium | Medium | Yes (Blob URL) |
| 7 | Raycast throttle | Both | Low | Medium | Yes |
| 8 | Name normalization Map | R1 | Low | Medium | Yes |
| 9 | Drop Tailwind CDN | Both | High | Medium | Manual CSS |
| 10 | Named constants | R1 | Low | Low | Yes |

**Recommendation:** Items 1–5 are actionable. 1–2 are ethically load-bearing. 3–4 prevent real user-facing failures. 5 is a quick security hygiene pass. Items 6+ are improvement, not necessity, at current project scale.
