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

## Planned features

- **2D structure** — proper bond geometry and layout from a SMILES string,
  rendered on canvas via [smiles-drawer](https://github.com/reymond-group/smilesDrawer).
- **3D model** — a real 3D conformer generated client-side and rendered as a
  spinnable, zoomable model via [3Dmol.js](https://3dmol.csb.pitt.edu/).
- **Formula & molecular weight** — computed from the parsed structure, shown
  alongside the render.
- **Paste-to-render** — no upload, no account, no build step for the user;
  open the page and paste.

## Stack

Static, client-side JavaScript. No backend, no database, no user accounts.
Built with [esbuild](https://esbuild.github.io/) and tested with Node's
built-in test runner (`node:test`).

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the full design
and [`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```
npm install
npm test        # run the unit test suite
npm run build   # bundle the app into dist/
npm run dev     # serve src/ locally for manual testing
```

## License

MIT — see [`LICENSE`](LICENSE).
