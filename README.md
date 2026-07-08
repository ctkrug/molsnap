# Molsnap

[![CI](https://github.com/ctkrug/molsnap/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/molsnap/actions/workflows/ci.yml)

Paste a SMILES string. Get a clean 2D structure, a spinnable 3D model, and the
molecular formula + weight — instantly, in your browser, no login and no
server round-trip.

```
CC(=O)Oc1ccccc1C(=O)O  →  aspirin, rendered and rotating, C9H8O4, 180.16 g/mol
```

## Why

Chemists, students, and the chemistry-curious constantly need a fast way to
turn a SMILES string into something they can actually look at. Existing tools
are either heavyweight desktop software, gated behind an account, or round-trip
to a server for what is fundamentally a client-side computation. Molsnap is a
scratchpad: paste, see it, done.

## Features

- **2D structure** — proper bond geometry and layout from a SMILES string,
  rendered on canvas via [smiles-drawer](https://github.com/reymond-group/smilesDrawer).
- **3D model** — atoms relax into 3D client-side (a lightweight
  distance-geometry embedder — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
  for why) and render as a spinnable, zoomable model via
  [3Dmol.js](https://3dmol.csb.pitt.edu/), with a pause/resume auto-rotate toggle.
- **Formula & molecular weight** — Hill-notation formula and molecular
  weight, computed via [RDKit's WASM build](https://www.rdkit.org/docs/)
  from the same atom accounting that drives the 3D structure.
- **Paste-to-render** — no upload, no account, no build step for the user;
  open the page and paste.
- **Quick-pick examples** — aspirin, caffeine, ibuprofen, benzene, and water
  chips render instantly.
- **Shareable renders** — the SMILES syncs to the URL's `?smiles=` query
  string, so any rendered molecule is a copy-pasteable link.
- **Copy to clipboard** — one click to copy the SMILES or the formula.

## Stack

Static, client-side JavaScript. No backend, no database, no user accounts.
Built with [esbuild](https://esbuild.github.io/) and tested with Node's
built-in test runner (`node:test`).

## Status

Core render pipeline is functionally complete — see
[`docs/VISION.md`](docs/VISION.md) for the full design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```
npm install
npm test        # run the unit test suite
npm run build   # bundle the app into dist/
npm run dev     # serve src/ locally for manual testing
```

`site/` is a separate static landing page (no build step) — open
`site/index.html` directly or serve the directory to preview it.

## License

MIT — see [`LICENSE`](LICENSE).
