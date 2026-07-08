---
title: "Molsnap: paste a SMILES string, see the molecule in your browser"
published: false
tags: javascript, chemistry, webassembly, showdev
---

A SMILES string is a great way for a computer to store a molecule and a
terrible way for a human to read one. `CC(=O)Oc1ccccc1C(=O)O` is aspirin, but
you would not know that at a glance, and if you work with these strings, you
run into them constantly: in papers, in dataset columns, in problem sets. The
tools that turn one into a picture are usually heavyweight desktop software or
a web app behind a login. I wanted a scratchpad: paste, look, done.

So I built [Molsnap](https://apps.charliekrug.com/molsnap/). Paste a SMILES,
and it draws the 2D structure, builds a 3D model you can spin, and shows the
formula and molecular weight, all client-side. Here are the two build
decisions that turned out to be interesting.

## Three libraries, three jobs

There is no single library that does 2D layout, 3D coordinates, and formula
math well, so I used three and gave each one only the job it is good at:

- [smiles-drawer](https://github.com/reymond-group/smilesDrawer) parses the
  SMILES and lays out the flat 2D structure straight to a canvas.
- [RDKit](https://www.rdkit.org/) (compiled to WebAssembly) is the real
  chemistry engine. It re-parses the SMILES into a canonical molecule with
  explicit hydrogens, which gives me the atom accounting behind the Hill
  formula and the molecular weight.
- [3Dmol.js](https://3dmol.csb.pitt.edu/) renders the 3D model into an
  interactive viewer.

The nice property here is that the RDKit molblock is a single source of truth.
The same atom list feeds the formula math and the 3D view, so the readout and
the structure can never quietly disagree about what atoms are present.

## The 3D model has no ETKDG behind it, and that is on purpose

My original plan was to let RDKit generate a proper 3D conformer with ETKDG.
Then I checked what the minimal RDKit WASM build actually exposes, and there is
no embedding API in it at all: no `EmbedMolecule`, no ETKDG, no force field.
Pulling in a full RDKit build to get one function is a lot of megabytes for a
paste-and-look toy.

So I wrote a small distance-geometry relaxation instead. Every bond is a spring
pulling its two atoms toward an ideal length (looked up by element pair and
bond order), every non-bonded pair pushes apart, and the whole thing iterates
until it settles. It is maybe 60 lines, it runs instantly, and it produces
shapes that look plausible and spin well. It is explicitly *not* an
energy-minimized conformer, and I say so in the UI and the docs, because a
chemistry tool that quietly hands you wrong geometry is worse than one that is
honest about being an approximation.

## A WASM gotcha worth knowing

`RDKit_minimal.js` is Emscripten glue code that branches on
`typeof process === "object"` and calls `require("fs")` in the Node path.
esbuild cannot prove that branch is dead when bundling for the browser, so
bundling it drags in a `require("fs")` that breaks at runtime. The fix was to
stop bundling it: I copy the file as-is into the build output and load it with
a plain `<script>` tag, exactly the way RDKit's own docs suggest. Everything
else still goes through esbuild.

One more small thing that paid off: the formula and weight math lives in its
own pure module with no dependency on RDKit or the DOM. That kept it fast to
unit test in Node, no browser or WASM needed, which is most of the test suite.

## What I would do differently

If Molsnap grew up, I would ship a larger RDKit build with real conformer
generation and run the WASM in a Web Worker so the main thread never stalls on
a big molecule. For a paste-and-see scratchpad, though, the lightweight version
does the job.

Code is on [GitHub](https://github.com/ctkrug/molsnap), and the live tool is
at [apps.charliekrug.com/molsnap](https://apps.charliekrug.com/molsnap/). If
you try it on a molecule that renders badly, I would genuinely like to see it.
