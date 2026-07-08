import { test } from "node:test";
import assert from "node:assert/strict";
import initRDKitModule from "@rdkit/rdkit/dist/RDKit_minimal.js";
import { parseMolblock, atomCountsFromAtoms } from "../src/chem/molblock.js";
import { toHillFormula, molecularWeight } from "../src/chem/formula.js";

// Exercises the real RDKit WASM module end to end (SMILES -> molblock ->
// atom counts -> formula/weight) the same way main.js does, instead of
// mocking RDKit's output. These are slower than the pure-logic unit tests,
// so they live in their own file.

const RDKit = await initRDKitModule();

function analyze(smiles) {
  const mol = RDKit.get_mol(smiles);
  if (!mol) return null;
  try {
    const { atoms } = parseMolblock(mol.add_hs());
    const counts = atomCountsFromAtoms(atoms);
    return { formula: toHillFormula(counts), weight: molecularWeight(counts) };
  } finally {
    mol.delete();
  }
}

const REFERENCE_MOLECULES = [
  { name: "water", smiles: "O", formula: "H2O", weight: 18.015 },
  { name: "benzene", smiles: "c1ccccc1", formula: "C6H6", weight: 78.114 },
  { name: "aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O", formula: "C9H8O4", weight: 180.157 },
  {
    name: "caffeine",
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    formula: "C8H10N4O2",
    weight: 194.19,
  },
  { name: "ethanol", smiles: "CCO", formula: "C2H6O", weight: 46.069 },
];

for (const { name, smiles, formula, weight } of REFERENCE_MOLECULES) {
  test(`formula/weight for ${name} match known reference values`, () => {
    const result = analyze(smiles);
    assert.equal(result.formula, formula);
    assert.ok(
      Math.abs(result.weight - weight) < 0.1,
      `expected ~${weight} for ${name}, got ${result.weight}`
    );
  });
}

const BROAD_SMILES = [
  "CC(=O)Oc1ccccc1C(=O)O", // aspirin
  "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", // caffeine
  "c1ccccc1", // aromatic ring
  "O", // water
  "CCO", // ethanol
  "C#N", // triple bond
  "C=C", // double bond
  "CC(C)Cc1ccc(cc1)C(C)C(=O)O", // ibuprofen, branches
  "[NH4+]", // charge
  "[Cl-]", // anion
  "CCN(CC)CC", // triethylamine, branches
  "c1ccc2ccccc2c1", // fused aromatic rings (naphthalene)
  "FC(F)(F)C(=O)O", // halogens (F)
  "ClCCCl", // halogens (Cl)
  "BrCCBr", // halogens (Br)
  "CC(=O)N", // amide
  "c1ccncc1", // aromatic heteroatom (pyridine)
  "OCC(O)CO", // glycerol
  "CC(C)(C)O", // tert-butanol
  "C1CCCCC1", // cyclohexane
];

test(`a broad set of ${BROAD_SMILES.length} valid SMILES all parse and render an atom count`, () => {
  for (const smiles of BROAD_SMILES) {
    const result = analyze(smiles);
    assert.ok(result, `expected ${smiles} to parse`);
    assert.ok(result.formula.length > 0);
    assert.ok(result.weight > 0);
  }
});

test("an unparseable SMILES string returns null instead of throwing", () => {
  assert.equal(analyze("not-a-smiles"), null);
  assert.equal(analyze("((((("), null);
});
