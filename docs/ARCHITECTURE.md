# Architecture — Molsnap

A static, client-side SMILES viewer. No backend, no build-time server code —
everything in `src/` bundles into a self-contained `site/app/` that can be
hosted from any subpath. The committed `site/index.html` is the marketing
landing page; the build drops the app beside it under `site/app/`, so hosting
the `site/` tree serves the landing at `/` and the app at `/app/`.

## Data flow

```
SMILES string (input)
  │
  ├─ SmilesDrawer.parse() ──────────────► 2D canvas layout (src/main.js draw2d)
  │
  └─ RDKit WASM (src/chem/rdkit.js)
        mol.add_hs() → V2000 molblock (all-explicit-hydrogens)
          │
          ├─ parseMolblock() ──► atoms[] + bonds[]  (src/chem/molblock.js)
          │     │
          │     ├─ atomCountsFromAtoms() → { C: 9, H: 8, O: 4 }
          │     │     └─ toHillFormula() / molecularWeight()  (src/chem/formula.js)
          │     │           → formula/weight readout
          │     │
          │     └─ embed3d(atoms, bonds) → atoms with relaxed 3D coords
          │           (src/chem/embed3d.js, src/chem/bondLengths.js)
          │           │
          │           └─ toMolblock() → V2000 with 3D coords
          │                 └─ 3Dmol.js viewer.addModel() → spinnable 3D view
```

RDKit's molblock is the single source of truth: the same atom list feeds the
formula/weight calculation and the 3D embedder, so they can never disagree
about what atoms are present.

## Modules

- `src/main.js` — DOM wiring: form submit, RDKit lifecycle (loading state →
  ready), render pipeline, spin toggle, example chips, copy-to-clipboard,
  URL sync, resize handling.
- `src/chem/rdkit.js` — loads the RDKit WASM module (via the classic
  `<script>` tag, not bundled — see "RDKit is not bundled" below) and wraps
  `get_mol()` / `add_hs()` into `analyzeSmiles()`.
- `src/chem/molblock.js` — a minimal V2000 molfile reader/writer: parses
  atom positions + element symbols + bond connectivity, and serializes them
  back out after the embedder updates coordinates. Also derives the
  element → count map used for the formula.
- `src/chem/formula.js` + `src/chem/periodicTable.js` — pure Hill-notation
  formula string and molecular weight sum from an atom-count map. No
  dependency on RDKit or a browser; fast to unit test.
- `src/chem/embed3d.js` + `src/chem/bondLengths.js` — **not real ETKDG.**
  The installed `@rdkit/rdkit` "minimal" WASM build exposes no conformer
  embedding API at all (confirmed by inspecting its bound method names —
  there is no `embed`/`ETKDG`/`MMFF`/`UFF` symbol anywhere in the wasm).
  Instead, `embed3d()` relaxes RDKit's flat 2D layout into 3D itself: bonds
  act as springs pulling toward an ideal length (`bondLengths.js`, by
  element pair + bond order), and every non-bonded atom pair repels. This is
  a lightweight distance-geometry approximation — good enough for a
  spinnable viewer, not a scientifically rigorous conformer.
- `src/chem/validateInput.js` — the SMILES length guard (500 chars) used
  before anything touches the parser.
- `src/index.html` / `src/styles.css` — markup and the blueprint/technical
  design system from `docs/DESIGN.md`.
- `scripts/build.js` — esbuild bundle of `src/main.js`, plus copying
  `index.html`, `styles.css`, and RDKit's `RDKit_minimal.js`/`.wasm` into
  `site/app/`. `--serve` runs an esbuild dev server with watch over the
  whole `site/` tree.

## RDKit is not bundled

`RDKit_minimal.js` is Emscripten glue code that branches on
`typeof process == "object"` and calls `require("fs")` in the Node code
path. esbuild can't prove that branch is dead when bundling for a browser
target, so bundling it pulls in a `require("fs")` that breaks in-browser.
Instead it's copied as-is into `site/app/` and loaded via a plain `<script>` tag
in `index.html` (see `loadRDKit()` in `src/chem/rdkit.js`), which sets
`window.initRDKitModule` the same way RDKit's own docs demonstrate.

## Testing

- `test/*.test.js` (except `chem-integration.test.js`) are pure-logic unit
  tests — no browser, no WASM.
- `test/chem-integration.test.js` runs the real RDKit WASM module in Node
  (RDKit_minimal.js works in both Node and browser) through the full
  molblock → atom-count → formula/weight pipeline, against reference
  molecules and a broad SMILES spread.
- `test/build.test.js` is a smoke test that `npm run build` produces a
  self-contained `site/app/` with relative asset paths.
- There is no in-repo browser/DOM test harness for `src/main.js` itself;
  its behavior (rendering, clipboard, URL sync, a11y) has been verified
  manually with Playwright during development, not via an automated suite.

## Run it

```
npm install
npm test
npm run build   # → site/app/
npm run dev     # esbuild dev server at http://localhost:8080 (app at /app/)
```
