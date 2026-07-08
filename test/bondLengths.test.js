import { test } from "node:test";
import assert from "node:assert/strict";
import { idealBondLength } from "../src/chem/bondLengths.js";

test("idealBondLength returns a known single-bond length regardless of argument order", () => {
  assert.equal(idealBondLength("C", "H"), 1.09);
  assert.equal(idealBondLength("H", "C"), 1.09);
});

test("idealBondLength shortens for higher bond orders", () => {
  const single = idealBondLength("C", "C", 1);
  const double = idealBondLength("C", "C", 2);
  const triple = idealBondLength("C", "C", 3);
  assert.ok(double < single, "double bond should be shorter than single");
  assert.ok(triple < double, "triple bond should be shorter than double");
});

test("idealBondLength has a distinct aromatic (order 4) length between single and triple", () => {
  const single = idealBondLength("C", "C", 1);
  const aromatic = idealBondLength("C", "C", 4);
  const triple = idealBondLength("C", "C", 3);
  assert.ok(aromatic < single && aromatic > triple);
});

test("idealBondLength falls back to a generic length for an unknown element pair", () => {
  assert.equal(idealBondLength("Xx", "Yy"), 1.5);
});

test("idealBondLength falls back to the single-bond scale for an unrecognized order", () => {
  assert.equal(idealBondLength("C", "C", 7), idealBondLength("C", "C", 1));
});
