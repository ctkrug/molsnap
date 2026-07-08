# Changelog

## Unreleased

- Core render pipeline: RDKit WASM parses SMILES and drives a shared atom
  accounting for the Hill formula/weight readout and a custom
  distance-geometry 3D embedder rendered via 3Dmol.js — replacing the
  earlier 2D-only, placeholder-readout scaffold.
- Broad SMILES coverage (aromatics, branches, multi-bonds, charges,
  halogens), pathological-input guarding, and a designed invalid-input state.
- Interaction polish: pause/resume auto-rotate, quick-pick example chips,
  shareable `?smiles=` URLs, and copy-to-clipboard for the SMILES and
  formula.
- A static landing page (`site/`) in the same blueprint direction as the app.
- Project scaffold: static JS app structure, formula/weight calculator with
  tests, esbuild bundler, ESLint, CI, and the design/vision/backlog docs.
