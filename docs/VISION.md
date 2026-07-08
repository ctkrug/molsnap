# Vision — Molsnap

## The problem

Anyone who works with molecules — chemistry students, researchers sketching
an idea, developers building a chem-adjacent feature — regularly has a SMILES
string in hand and wants to *see* it: the 2D skeleton, a 3D sense of its
shape, and its formula and weight. The tools that do this are either desktop
software (ChemDraw, Avogadro), gated behind an account (most web viewers), or
round-trip the SMILES to a server to do work a browser can do on its own.
There's no "paste it, see it" scratchpad.

## Who it's for

- A chemistry student checking what a compound from a problem set looks like.
- A researcher or hobbyist sanity-checking a SMILES string they wrote by hand.
- A developer who wants a quick visual reference while building something
  chemistry-adjacent, without pulling in a heavyweight desktop tool.

Nobody in this audience wants to sign up for an account or install anything
to answer "what does this molecule look like?"

## The core idea

One page. One input. Paste a SMILES string, press render (or just land with
the default aspirin example already rendered), and get:

1. A correctly laid-out 2D structure.
2. A real, spinnable 3D model — not a hand-wave, an actual generated 3D
   conformer.
3. The molecular formula (Hill notation) and molecular weight.

All computed **client-side**, in the browser, with zero backend and zero
account. The page works the same whether it's opened once or a thousand
times, and whether Molsnap's own server is up or the user opened a static
export.

## Key design decisions

- **Three libraries, three jobs, no overlap:**
  - [smiles-drawer](https://github.com/reymond-group/smilesDrawer) parses the
    SMILES and lays out the 2D structure directly to canvas.
  - [@rdkit/rdkit](https://www.rdkit.org/docs/) (RDKit compiled to
    WebAssembly) is the chemistry engine: it re-parses the SMILES, generates
    a 3D conformer (ETKDG embedding), and derives the molecular formula and
    exact/average molecular weight — the parts that need real cheminformatics
    rather than a canvas layout algorithm.
  - [3Dmol.js](https://3dmol.csb.pitt.edu/) renders the 3D conformer RDKit
    produces (as a mol block) into an interactive, spinnable viewer.
  - This split means each library does only what it's uniquely good at,
    rather than asking one library to also do the others' job badly.
- **Static and self-contained.** No backend, no database, no accounts. The
  whole app is a bundle plus two static assets, buildable into one directory
  and hostable from any subpath (`apps.charliekrug.com/molsnap` or a plain
  file:// open).
- **Formula/weight math lives in its own pure module** (`src/chem/formula.js`),
  independent of whichever parser produced the atom counts, so it stays fast
  to unit test without a browser or WASM runtime.
- **Fail loud, not silent.** An unparseable SMILES shows a clear inline error
  (input flashes invalid, status line explains) — it never renders a blank
  or wrong structure without saying so.

## What "v1 done" looks like

- Pasting `CC(=O)Oc1ccccc1C(=O)O` (aspirin) renders its 2D structure, a
  spinnable 3D model, and shows `C9H8O4` / `180.16 g/mol` — the wow moment,
  working end to end.
- A reasonably broad set of valid SMILES (simple organics, aromatics,
  charges, common heteroatoms) render correctly in all three views; invalid
  input fails with a clear, non-crashing message.
- The page is fully responsive (390px through 1440px+), matches
  `docs/DESIGN.md`'s blueprint direction, and passes the design self-review
  in every QA pass.
- CI is green: the formula/weight unit tests pass and the production bundle
  builds cleanly on every push.
