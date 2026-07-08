# Backlog — Molsnap

Epics and stories for the build. Every story has verifiable acceptance
criteria — concrete checks, not vibes. Story 1.1 is the wow moment and
ships before anything else.

## Epic 1 — Core render pipeline

The paste-to-render path: 2D, 3D, formula, weight, for real molecules.

- [x] **1.1 — Wow moment: paste aspirin, see it rendered in 2D + 3D with formula/weight**
  - Pasting `CC(=O)Oc1ccccc1C(=O)O` and pressing render shows a correctly
    laid-out 2D structure AND a spinnable 3D model within 2 seconds.
  - The formula readout shows `C9H8O4` and the weight readout shows
    `180.16 g/mol` (± 0.05).
  - This is the default pre-filled example, so it renders automatically on
    first load with no user action required.

- [x] **1.2 — Generate 3D coordinates and render them, replacing the empty viewer**
  - **Adapted:** the installed `@rdkit/rdkit` WASM build exposes no conformer
    embedding API at all (no ETKDG/MMFF/UFF binding — verified by inspecting
    its exported method names, see `docs/ARCHITECTURE.md`). RDKit still
    parses the SMILES and supplies atoms/bonds/2D layout via `add_hs()`;
    `src/chem/embed3d.js` relaxes that into 3D itself (bond-spring + pairwise
    repulsion distance geometry) as a mol block, replacing the empty
    placeholder viewer.
  - The 3D viewer renders that mol block via 3Dmol.js with a ball-and-stick
    style, orbit-to-rotate, and auto-rotate on load.
  - RDKit's WASM module loads asynchronously; the render button is disabled
    with a loading label until it's ready, never silently failing on first
    click.

- [x] **1.3 — Formula and molecular weight from RDKit, not a placeholder**
  - The formula/weight readout is computed from RDKit's own atom
    accounting (via `src/chem/formula.js`) for the currently parsed
    molecule, not the earlier placeholder text.
  - Values match known references for at least 5 test molecules (water,
    benzene, aspirin, caffeine, ethanol) within 0.1 g/mol.

- [x] **1.4 — Handle a broad, realistic range of SMILES input**
  - Aromatic rings (lowercase atoms), branches, double/triple bonds,
    charges (`[NH4+]`), and common heteroatoms (N, O, S, P, halogens) all
    parse and render correctly for a curated list of 15+ test SMILES.
  - An unparseable string (e.g. `not-a-smiles`) shows the invalid-input
    state and a clear inline message — it never throws to the console
    without also updating the UI, and never leaves a stale render on screen.

## Epic 2 — Interaction and design polish

Make the tool feel good to use and match the design direction.

- [x] **2.1 — 3D viewer controls**
  - Drag orbits, scroll/pinch zooms, and there's a visible toggle to
    pause/resume auto-rotate.
  - Controls work with both mouse and touch (tested at a 390px viewport).

- [x] **2.2 — Design polish pass against docs/DESIGN.md**
  - The full juice plan is implemented: valid-input pulse, invalid shake,
    panel fade/scale-in, grid backdrop drift, wordmark bond-glyph pulse.
  - Verified at 390×844, 768×1024, and 1440×900 — no horizontal scroll, no
    overlapping elements, hero panels fill ≥60% of viewport height on
    desktop.
  - `prefers-reduced-motion` disables the shake/drift/pulse animations
    while keeping the app fully functional.

- [x] **2.3 — Shareable render via URL**
  - Rendering a SMILES updates the URL query string (e.g. `?smiles=...`)
    without a full page reload.
  - Opening a URL with a `?smiles=` param renders that molecule
    automatically on load.

- [x] **2.4 — Quick-pick example gallery**
  - A row of chips (aspirin, caffeine, ibuprofen, benzene, water) sits
    below the input strip; clicking one fills the input and renders it.
  - Chips are keyboard-focusable and activate on Enter/Space.

## Epic 3 — Robustness and performance

- [x] **3.1 — Cold-start loading state for the RDKit WASM module**
  - On first page load, a visible "loading chemistry engine" state shows
    until RDKit's WASM is ready; the render button is disabled until then.
  - Subsequent renders in the same session have no perceptible RDKit
    init delay.

- [x] **3.2 — Guard against pathological input**
  - A SMILES string over 500 characters is rejected client-side with an
    inline message before it reaches the parser, rather than hanging the
    tab.
  - 3D embedding failures (RDKit can parse but not embed some structures)
    fall back to showing the 2D structure and formula/weight with a
    message explaining 3D isn't available for this molecule, instead of a
    blank panel or a crash.

- [x] **3.3 — Copy-to-clipboard for formula and SMILES**
  - A copy icon next to the formula readout and next to the input both
    copy their respective text to the clipboard and show a brief
    "copied" confirmation.

- [x] **3.4 — Accessibility audit**
  - All interactive controls are reachable by keyboard in a sane focus
    order and show a visible focus ring.
  - The parse status region is announced by screen readers on change
    (`aria-live`, already scaffolded) and icon-only controls have
    `aria-label`s.

## Epic 4 — Ship

- [x] **4.1 — Landing page**
  - `site/` contains a static landing page using the same DESIGN.md
    tokens and direction as the app, explaining what Molsnap is and
    linking to the live app.
  - Builds into a single self-contained directory with relative asset
    paths (works when hosted under a subpath).

- [x] **4.2 — Final ship-gate QA pass**
  - Every acceptance criterion above is re-verified once, end to end, on
    a clean checkout (`npm ci && npm test && npm run build`).
  - The design self-review checklist in `docs/DESIGN.md` is walked
    through and passes with no open defects.
