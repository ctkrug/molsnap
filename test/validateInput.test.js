import { test } from "node:test";
import assert from "node:assert/strict";
import { isTooLong, MAX_SMILES_LENGTH } from "../src/chem/validateInput.js";

test("isTooLong is false for an empty string", () => {
  assert.equal(isTooLong(""), false);
});

test("isTooLong is false right at the limit", () => {
  assert.equal(isTooLong("C".repeat(MAX_SMILES_LENGTH)), false);
});

test("isTooLong is true one character past the limit", () => {
  assert.equal(isTooLong("C".repeat(MAX_SMILES_LENGTH + 1)), true);
});
