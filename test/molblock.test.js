import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMolblock, toMolblock, atomCountsFromAtoms } from "../src/chem/molblock.js";

const WATER_MOLBLOCK = `
     molsnap

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.7500    0.5000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.7500    0.5000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
  1  3  1  0
M  END
`;

test("parseMolblock reads atom positions and element symbols", () => {
  const { atoms } = parseMolblock(WATER_MOLBLOCK);
  assert.equal(atoms.length, 3);
  assert.equal(atoms[0].symbol, "O");
  assert.equal(atoms[1].symbol, "H");
  assert.equal(atoms[0].x, 0);
  assert.equal(atoms[1].y, 0.5);
});

test("parseMolblock reads bonds as 0-based atom indices", () => {
  const { bonds } = parseMolblock(WATER_MOLBLOCK);
  assert.deepEqual(bonds, [
    { a: 0, b: 1, order: 1 },
    { a: 0, b: 2, order: 1 },
  ]);
});

test("parseMolblock on an empty molecule (zero atoms/bonds) returns empty arrays", () => {
  const empty = "\n     molsnap\n\n  0  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n";
  const { atoms, bonds } = parseMolblock(empty);
  assert.deepEqual(atoms, []);
  assert.deepEqual(bonds, []);
});

test("toMolblock round-trips through parseMolblock unchanged", () => {
  const { atoms, bonds } = parseMolblock(WATER_MOLBLOCK);
  const serialized = toMolblock(atoms, bonds);
  const reparsed = parseMolblock(serialized);
  assert.equal(reparsed.atoms.length, atoms.length);
  assert.deepEqual(reparsed.bonds, bonds);
  reparsed.atoms.forEach((atom, i) => {
    assert.equal(atom.symbol, atoms[i].symbol);
    assert.ok(Math.abs(atom.x - atoms[i].x) < 1e-6);
  });
});

test("toMolblock on an empty atom/bond list still produces a parseable counts line", () => {
  const serialized = toMolblock([], []);
  const { atoms, bonds } = parseMolblock(serialized);
  assert.deepEqual(atoms, []);
  assert.deepEqual(bonds, []);
});

test("atomCountsFromAtoms tallies symbols into a count map", () => {
  const { atoms } = parseMolblock(WATER_MOLBLOCK);
  assert.deepEqual(atomCountsFromAtoms(atoms), { O: 1, H: 2 });
});

test("atomCountsFromAtoms on an empty atom list returns an empty map", () => {
  assert.deepEqual(atomCountsFromAtoms([]), {});
});
