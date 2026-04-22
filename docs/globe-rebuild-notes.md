# Globe Rebuild Notes

Architecture audit document for the "Pathways of Labor" globe visualization.
Covers rationale, dependency posture, known gotchas, and build order.
Last updated: 2026-04-16.

---

## 1. Why We Rebuilt Instead of Using globe.gl

globe.gl is a capable library, but it pulls in an undifferentiated runtime surface — shader chunks,
texture loaders, event utilities, polygon renderers, hex-bin pipelines — none of which we need, none
of which we can audit quickly when a CVE or supply-chain incident touches the npm graph. For a
security-sensitive visualization that handles real labor-route data, minimizing third-party runtime
code is a first-class constraint, not an optimization. Full auditability means every line that runs
in a visitor's browser can be traced to a decision made by this team. The globe.gl npm package
bundles approximately 12 transitive dependencies; a security audit would need to cover every one of
them plus the mechanisms by which they reach the DOM and the renderer. That cost compounds over
time as dependencies release updates.

The rebuild cost is modest. Our required slice — sphere with texture, orbit controls, atmosphere
glow, city-point markers, arc animations, and a raycaster-driven tooltip — lands at approximately
325 lines of application code. That is well within the threshold where "write it ourselves and own
it fully" beats "accept a large opaque dependency." We also sidestep globe.gl's peer-dependency tree
(d3-geo, d3-array, kapsule, accessor-fn, etc.), which collectively adds hundreds of additional LOC
we do not control. The rebuild produces a single, self-contained `Globe.js` module that any engineer
on the team can read top-to-bottom in under an hour. When the security posture needs to be reviewed,
that review is bounded and tractable.

---

## 2. Dependency Posture

Runtime dependencies are intentionally minimal. Every external resource loaded at runtime is listed
here. Any addition to this list requires explicit team sign-off and a corresponding SRI hash update.

- **three** (pinned to an exact version, e.g., `0.165.0`) — loaded via jsDelivr CDN with a full
  SRI hash (`integrity="sha384-..."`) on the script tag. This is the only external package that
  executes at runtime. The WebGL scene graph, renderer, camera, geometry primitives, material
  system, texture loader, and animation utilities all come from Three.js. Pinning an exact version
  means the hash is stable and a version bump is a deliberate, reviewed code change — not something
  that happens automatically at deploy time.

- **Nothing else** — `d3-geo`'s `geoInterpolate` function, which is used to sample intermediate
  waypoints on a great-circle arc, is inlined directly in `Globe.js` as approximately 10 lines of
  arithmetic. This eliminates the entire d3 dependency while keeping the math auditable in-context.
  The inline implementation is equivalent to d3's production version; the algorithm is public domain
  spherical linear interpolation and carries no copyright obligation.

- **Night Earth texture** — hosted locally in `src/assets/earth-night.jpg`. It is NOT fetched from
  NASA, Mapbox, or any external URL at runtime. Fetching from an external host at runtime would
  introduce an uncontrolled network dependency, would require a CSP image-src carveout for that
  host, would create a reliability dependency on a third-party server, and would expose visitor IP
  addresses to that server. The asset is committed to the repository and served from our own origin.
  Future texture updates are an explicit, versioned repository commit.

---

## 3. Architecture Overview

All scene logic lives in a single exported `Globe` class (`src/Globe.js`, ~325 LOC). The class
constructs and owns the Three.js `WebGLRenderer`, `Scene`, `PerspectiveCamera`, and
`requestAnimationFrame` loop. Consumer code interacts exclusively through the public API; no
internal Three.js objects are exposed as properties. The six public methods are:

- `setTexture(url)` — loads or swaps the earth surface texture. Disposes the previous texture
  before loading the new one to avoid GPU memory leaks.
- `setPoints(data)` — accepts an array of `{ lat, lng, color, size }` objects and rebuilds the
  city-marker layer. Previous point meshes are disposed.
- `setArcs(data)` — accepts `{ startLat, startLng, endLat, endLng, color }` pairs and rebuilds
  all arc TubeGeometry meshes. Previous arc meshes are disposed.
- `start()` — registers the `requestAnimationFrame` callback and begins the render loop.
- `stop()` — cancels the animation frame and halts rendering without destroying scene state.
- `destroy()` — cancels the loop, calls `.dispose()` on all geometries, materials, and textures,
  removes the renderer's canvas from the DOM, and nulls internal references to allow GC.

No rendering logic leaks outside this class. The six internal subsystems and their approximate LOC
contributions are: sphere + texture (~40 LOC), orbit controls (~25 LOC), atmosphere glow shader
(~45 LOC), points layer (~55 LOC), arcs layer (~90 LOC), raycaster + tooltip (~70 LOC). The
remaining ~25 LOC cover the constructor, `destroy`, and the animation loop integration.

---

## 4. The Five Gotchas

Each entry follows the format: **What goes wrong**, **Why it happens**, **How we handle it**.
These are issues that will silently break the visual output if not explicitly addressed.

---

### Gotcha 1 — TubeGeometry vs. Line linewidth

**What goes wrong:** Arcs rendered with `THREE.Line` and `LineBasicMaterial.linewidth > 1` appear
as 1 px hairlines on all Windows and most Linux browsers, regardless of the value passed. Setting
`linewidth: 5` has no visible effect. The arcs look correct on macOS (where WebGL may use Metal
paths that happen to support wider lines) but broken for the majority of users.

**Why it happens:** The WebGL 1.0 and WebGL 2.0 specifications explicitly do not require
implementations to support line widths other than 1 px. The ANGLE translation layer used by
Chromium and Firefox on Windows ignores the width parameter entirely. This is a spec-level
limitation, not a Three.js bug. Globe.gl upstream documents this as a known limitation and applies
the same workaround described below.

**How we handle it:** Arcs are rendered as `THREE.Mesh` instances built from `THREE.TubeGeometry`
wrapping a `THREE.QuadraticBezierCurve3`. The control point for the Bezier is lifted above the
globe surface by the altitude formula from Gotcha 4. Tube radius is a configurable parameter
(default `0.003` globe-radius units). This approach works identically across all platforms and
allows arc color, opacity, and dash-offset animation via material updates without hairline
rendering artifacts.

---

### Gotcha 2 — Coordinate handedness (lat/lng → sphere)

**What goes wrong:** A naive conversion using `lng * PI/180` as the azimuthal angle produces a
globe where east and west are mirrored. A route from New York to London appears to travel eastward
across the Pacific instead of westward across the Atlantic. The error is visually obvious once you
know to look for it, but easy to miss during early development when only a few points are rendered.

**Why it happens:** Three.js spherical coordinates follow a right-hand convention where positive
theta increases counter-clockwise when viewed from above the Y axis (north pole). Geographic
longitude increases eastward, which is the clockwise direction from that vantage point. Using
longitude directly as theta produces a mirror image of the correct globe.

**How we handle it:** The canonical `polar2Cartesian` function used throughout the codebase is:

```js
function polar2Cartesian(lat, lng, radius = 1) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (90 - lng) * (Math.PI / 180);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
```

Subtracting `lng` from 90 rather than using `lng` directly corrects the handedness. This function
is defined once at the top of `Globe.js` and all coordinate conversions — for sphere vertices,
point placement, and arc endpoints — call it. No inline lat/lng math is permitted elsewhere in
the codebase.

---

### Gotcha 3 — SRGBColorSpace on textures

**What goes wrong:** The Night Earth texture renders with washed-out contrast and incorrect gamma.
City lights that should appear bright orange-white come out dim yellow. Ocean areas that should be
near-black appear as mid-grey. The image looks as if the gamma correction was applied twice, or
not at all.

**Why it happens:** Three.js r152 introduced a breaking change to the default texture color space
behavior. Textures loaded via `THREE.TextureLoader` now default to `THREE.NoColorSpace` (linear
light) unless the caller explicitly sets the color space. Prior to r152 the default was
`THREE.sRGBEncoding` (the old API name). Without declaring the color space, the renderer interprets
photographic sRGB texture data as linear light values, which produces the washed-out appearance
described above.

**How we handle it:** Immediately after loading any display texture, we set the color space
explicitly:

```js
const loader = new THREE.TextureLoader();
loader.load('src/assets/earth-night.jpg', (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  globeMaterial.map = texture;
  globeMaterial.needsUpdate = true;
});
```

This applies to the main earth surface texture and any bump or specular maps, which are also
photographic data stored in sRGB. Normal maps are the exception — they encode direction vectors,
not colors, and must use `THREE.NoColorSpace` to avoid being gamma-decoded.

---

### Gotcha 4 — Arc altitude for near-antipodal routes

**What goes wrong:** A fixed arc altitude (e.g., `altitude = 0.15` globe-radius units) works
acceptably for regional routes covering 20–40 degrees of arc, but visually clips into the globe
surface on long transcontinental or transpacific routes such as East Asia to the Americas or
Southeast Asia to Western Europe. The arc appears to tunnel through the globe rather than arching
over it.

**Why it happens:** The Bezier control point is placed at the midpoint of the arc, lifted by the
altitude value. For a small angular distance the midpoint is near the surface and a modest lift
produces a visible arch. For a large angular distance — approaching 180 degrees for near-antipodal
routes — the midpoint of the chord between endpoints is far from the surface, but the arc's
intermediate points still pass through the globe if the altitude is not proportionally larger.

**How we handle it:** Altitude is scaled proportionally to the angular distance between endpoints:

```js
const lat1r = startLat * (Math.PI / 180);
const lat2r = endLat   * (Math.PI / 180);
const lng1r = startLng * (Math.PI / 180);
const lng2r = endLng   * (Math.PI / 180);

const angularDist = Math.acos(
  Math.sin(lat1r) * Math.sin(lat2r) +
  Math.cos(lat1r) * Math.cos(lat2r) * Math.cos(lng2r - lng1r)
);
const altitude = 0.1 + 0.4 * (angularDist / Math.PI);
```

This yields approximately 0.1 radius units for local routes and up to 0.5 radius units for
near-antipodal routes. The coefficients `0.1` (base) and `0.4` (scale) were tuned visually
against the actual dataset. They can be adjusted without changing the formula's structure.

---

### Gotcha 5 — Atmosphere glow depth sorting

**What goes wrong:** Arcs that should appear in front of the atmospheric halo are visually
occluded by it at certain camera angles. Alternatively, the halo disappears when the camera
moves to a position where arcs intersect the halo mesh. The visual result is arcs that seem to
blink or vanish as the globe is rotated.

**Why it happens:** The atmosphere glow is a sphere mesh slightly larger than the globe, rendered
with `side: THREE.BackSide` so only the inner face is visible. It uses additive blending to
produce the glow effect. The WebGL depth buffer interacts badly with back-face rendering and
transparent/additive materials when the scene draw order is not carefully controlled. If the
atmosphere mesh is added to the scene before arcs, the depth test may discard arc fragments
that fall behind the atmosphere geometry's recorded depth values.

**How we handle it:** The atmosphere `MeshPhongMaterial` (or equivalent) is constructed with:

```js
{
  side:        THREE.BackSide,
  depthWrite:  false,
  blending:    THREE.AdditiveBlending,
  transparent: true,
}
```

The mesh is then added to the scene AFTER the globe sphere and AFTER all arc meshes. The
`depthWrite: false` flag prevents the atmosphere from writing to the depth buffer, so arc
fragments behind it are not discarded. For additional robustness, `renderOrder` is set
explicitly: the globe sphere uses `renderOrder = 0`, arcs use `renderOrder = 1`, and the
atmosphere mesh uses `renderOrder = 2`. The explicit renderOrder approach is preferred because
it makes the intent clear and is not sensitive to the order in which `scene.add()` calls happen
during construction.

---

## 5. Security Hygiene Checklist

The following measures are baked into `index.html` and the overall build posture. Each item
addresses a specific attack surface or failure mode. This list is the canonical reference for
security review of the globe component.

- **SRI hashes on all CDN script tags** — the Three.js script tag carries
  `integrity="sha384-<hash>"` and `crossorigin="anonymous"`. The browser rejects script execution
  if the fetched file does not match the hash. This prevents CDN compromise, BGP hijack, or
  transit tampering from silently injecting malicious code into the page.

- **Exact version pinning** — the CDN URL contains the literal version string (e.g.,
  `/three@0.165.0/build/three.module.js`), never a semver range, a channel alias, or `@latest`.
  Version bumps are explicit repository commits that go through normal review. There is no
  mechanism by which a new Three.js release can reach production without human review.

- **CSP meta tag** — the page carries a `Content-Security-Policy` meta tag that restricts
  `script-src` to `'self'` and `https://cdn.jsdelivr.net`. `object-src` is set to `'none'`.
  `base-uri` is restricted to `'self'`. The policy blocks inline scripts (`'unsafe-inline'` is
  absent) and `eval` (`'unsafe-eval'` is absent). This means even if an XSS vector exists in
  user-controlled data, it cannot execute arbitrary scripts.

- **No `eval`, no `innerHTML` with data** — tooltip content and any other dynamically generated
  UI use `element.textContent` for string values and explicit `document.createElement` /
  `parent.appendChild` calls for structural HTML. No template literals or string concatenation
  are used to construct HTML. This eliminates the primary XSS injection vector at the DOM level,
  complementing the CSP header defense.

- **Texture hosted locally** — `src/assets/earth-night.jpg` is committed to the repository and
  served from the same origin as the application. There is no runtime fetch to any external image
  host. The CSP does not need an `img-src` carveout for external hosts, and visitor IP addresses
  are not exposed to third-party servers through texture loading.

- **Zero third-party runtime dependencies beyond Three.js** — no analytics scripts, no tracking
  pixels, no font CDN requests, no polyfill services, no error reporting SDKs. Each of these
  categories has historically been a supply-chain attack vector. The attack surface is: our own
  code plus a single, SRI-pinned Three.js build.

---

## 6. Build Order (for the index.html implementation)

The steps below define the recommended implementation sequence. Each step is designed to be
individually verifiable before proceeding to the next. Skipping steps or implementing out of
order creates compounding debug surfaces that are hard to untangle.

1. **Sphere + texture + `polar2Cartesian` utility**
   Establishes the coordinate system, confirms the WebGL renderer initializes without errors, and
   provides a visual baseline. All subsequent steps depend on `polar2Cartesian` producing correct
   Cartesian coordinates. Verify by confirming the Night Earth texture renders with correct gamma
   (see Gotcha 3) and is oriented with north at the top.

2. **Orbit controls**
   Added second so that camera interaction is testable as soon as the sphere is visible. Verifying
   zoom, pan, and rotation before any data geometry is present eliminates camera configuration as
   a variable when debugging later steps. Confirm that the auto-rotate speed and zoom limits match
   the design spec.

3. **Atmosphere glow shader** (with depth/blend settings from Gotcha 5)
   Built before points and arcs so the `renderOrder` and `depthWrite` settings are in place from
   the start. Retrofitting these settings after arc geometry exists makes it harder to isolate
   depth sorting bugs. Verify that the halo is visible at the globe's limb and does not occlude
   the sphere surface when viewed straight-on.

4. **Points (city markers)**
   First dynamic data layer. Validates that `polar2Cartesian` correctly maps lat/lng pairs from
   the real dataset onto the sphere surface. Use a known city (e.g., New York at 40.71°N,
   74.01°W) as a sanity-check reference before loading the full dataset. Points are simpler to
   inspect visually than arcs and will reveal any east/west flip from Gotcha 2 immediately.

5. **Arcs (TubeGeometry + dash animation)**
   Built after points are confirmed correct. Arc geometry depends on Gotcha 1 (TubeGeometry),
   Gotcha 2 (coordinate handedness), and Gotcha 4 (altitude scaling) all being resolved. Testing
   arcs after points are validated means any remaining visual error is isolated to arc-specific
   logic rather than the shared coordinate system. Verify a transpacific route (e.g., Shanghai to
   Los Angeles) against a reference map to confirm altitude scaling is working correctly.

6. **Raycaster + tooltip**
   Added last because raycaster accuracy depends on all scene geometry being in its final
   position. The raycaster maintains references to scene objects; adding or removing objects after
   raycaster initialization requires a corresponding update to the object list. Adding it last
   eliminates this class of stale-reference bug. Verify by hovering over a city point and
   confirming the tooltip displays the correct city name.

---

## 7. Out of Scope (What We Chose Not to Rebuild)

The following features exist in globe.gl's API surface and are deliberately absent from this
rebuild. "Pathways of Labor" does not require any of them. Including them would increase the
auditable LOC count without serving the project's data narrative, and would reintroduce the
complexity that the rebuild was designed to eliminate.

- **Polygons** — country boundary fill geometries (GeoJSON fill rendering)
- **Hexbins** — hex-aggregated data density layers
- **Tiles** — raster tile streaming from Mapbox, Google Maps, or similar providers
- **Heatmaps** — continuous density gradient overlays
- **HTML overlays** — DOM elements positioned over 3D world coordinates
- **Labels** — floating text annotations anchored to geographic positions
- **Rings** — animated ring pulse effects centered on geographic points
- **Paths** — multi-segment polyline layers following geographic paths

Each of these is a deliberate omission from globe.gl's documented feature surface. If a future
iteration of the project requires one of these features, the implementation decision should be
evaluated against the security posture documented in Section 2: can the feature be added as a
~50 LOC audited extension to `Globe.js`, or does its complexity warrant reconsidering the
dependency posture and re-evaluating globe.gl or another library against the updated requirements?

---

*Document maintained by the Globe workstream. Update this file when architectural decisions change,
new gotchas are identified during implementation, or the dependency posture is revised. Do not
let this document fall out of sync with `src/Globe.js` — if they disagree, the code is the
ground truth and this document needs updating.*
