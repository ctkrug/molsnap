# Molsnap

**▶ Live demo: [apps.charliekrug.com/molsnap](https://apps.charliekrug.com/molsnap/)**

[![CI](https://github.com/ctkrug/molsnap/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/molsnap/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Paste a SMILES string, see the molecule. Molsnap turns chemistry's plain-text
shorthand into a clean 2D structure, a spinnable 3D model, and the molecular
formula and weight, all in your browser with no account and no server
round-trip.

```
CC(=O)Oc1ccccc1C(=O)O  ->  aspirin: 2D skeleton, spinnable 3D, C9H8O4, 180.16 g/mol
```

## Who it's for

Chemistry students, researchers, and developers who keep running into SMILES
strings in papers, datasets, and problem sets and just want to see the
structure. The usual options are heavyweight desktop software, an
account-gated web viewer, or a server round-trip for a computation the browser
can do on its own. Molsnap is the scratchpad in between: paste, look, done.

## Features

- **Real 2D structure.** Bond geometry and ring layout computed from the SMILES
  with [smiles-drawer](https://github.com/reymond-group/smilesDrawer), drawn to
  canvas. Any valid structure renders, not a curated few.
- **Spinnable 3D model.** Atoms are lifted out of the flat layout by an
  in-house distance-geometry embedder (the minimal RDKit WASM ships no
  conformer API, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)) and
  rendered with [3Dmol.js](https://3dmol.csb.pitt.edu/). Grab to orbit, scroll
  to zoom, pause the auto-rotate.
- **Formula and weight in sync.** Hill-notation formula and molecular weight
  come from the same atom accounting that drives the 3D view, so they never
  disagree. Parsing uses [RDKit's WASM build](https://www.rdkit.org/docs/).
- **Paste to render.** No upload, no account, no build step for the user.
- **Quick-pick examples.** Aspirin, caffeine, ibuprofen, benzene, and water
  render on tap.
- **Shareable links.** The SMILES syncs to the `?smiles=` query string, so any
  render is a copy-pasteable URL.
- **Copy to clipboard.** One click to copy the SMILES or the formula.

## Try these

Paste any of these into the input, or open the shareable link:

| Molecule | SMILES | Result |
|---|---|---|
| Aspirin | `CC(=O)Oc1ccccc1C(=O)O` | C9H8O4, 180.16 g/mol |
| Caffeine | `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` | C8H10N4O2, 194.19 g/mol |
| Ibuprofen | `CC(C)Cc1ccc(cc1)C(C)C(=O)O` | C13H18O2, 206.28 g/mol |
| Benzene | `c1ccccc1` | C6H6, 78.11 g/mol |
| Water | `O` | H2O, 18.02 g/mol |

## Run it locally

```
npm install
npm run dev     # esbuild dev server at http://localhost:8080 (app at /app/)
```

To build the static site:

```
npm run build   # bundles the app into site/app/
```

The deployable is the `site/` tree: `site/index.html` is the landing page and
the build drops the app beside it under `site/app/`. Both use relative asset
paths, so the whole thing hosts from any subpath.

## Development

```
npm test        # unit + build smoke tests (node:test)
npm run lint    # ESLint
npm run build   # production bundle
```

CI runs the same three steps on every push.

## How it works

A SMILES string goes to two places. smiles-drawer lays out the 2D structure,
and RDKit (WASM) parses it into an all-explicit-hydrogens molblock. That
molblock is the single source of truth: the same atom list feeds the
formula/weight math and the 3D embedder, which relaxes the flat coordinates
into a spinnable shape for 3Dmol.js to render. Full detail lives in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); the visual direction is in
[`docs/DESIGN.md`](docs/DESIGN.md).

## License

MIT, see [`LICENSE`](LICENSE).

---

More of Charlie's projects &rarr; [apps.charliekrug.com](https://apps.charliekrug.com)
