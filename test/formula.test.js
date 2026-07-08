import { test } from "node:test";
import assert from "node:assert/strict";
import { toHillFormula, molecularWeight } from "../src/chem/formula.js";

test("toHillFormula orders carbon, then hydrogen, then alphabetical (aspirin)", () => {
  assert.equal(toHillFormula({ C: 9, H: 8, O: 4 }), "C9H8O4");
});

test("toHillFormula omits a count of 1", () => {
  assert.equal(toHillFormula({ C: 1, H: 4 }), "CH4");
});

test("toHillFormula sorts alphabetically when there is no carbon", () => {
  assert.equal(toHillFormula({ H: 2, O: 1 }), "H2O");
  assert.equal(toHillFormula({ Na: 1, Cl: 1 }), "ClNa");
});

test("toHillFormula drops elements with a zero count", () => {
  assert.equal(toHillFormula({ C: 6, H: 6, N: 0 }), "C6H6");
});

test("molecularWeight sums atomic weights (aspirin, ~180.16 g/mol)", () => {
  const weight = molecularWeight({ C: 9, H: 8, O: 4 });
  assert.ok(Math.abs(weight - 180.16) < 0.05, `expected ~180.16, got ${weight}`);
});

test("molecularWeight throws on an unknown element symbol", () => {
  assert.throws(() => molecularWeight({ Xx: 1 }));
});
