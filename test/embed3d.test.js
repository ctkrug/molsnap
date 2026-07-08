import { test } from "node:test";
import assert from "node:assert/strict";
import { embed3d } from "../src/chem/embed3d.js";
import { idealBondLength } from "../src/chem/bondLengths.js";

function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2);
}

test("embed3d relaxes a bonded pair to (close to) its ideal bond length", () => {
  const atoms = [
    { symbol: "C", x: 0, y: 0, z: 0 },
    { symbol: "C", x: 1, y: 0, z: 0 },
  ];
  const bonds = [{ a: 0, b: 1, order: 1 }];
  const [p1, p2] = embed3d(atoms, bonds, { random: mulberry32(1) });
  assert.ok(Math.abs(distance(p1, p2) - idealBondLength("C", "C", 1)) < 0.01);
});

test("embed3d pushes apart a non-bonded pair placed on top of each other", () => {
  const atoms = [
    { symbol: "C", x: 0, y: 0, z: 0 },
    { symbol: "C", x: 0, y: 0, z: 0 },
  ];
  const [p1, p2] = embed3d(atoms, [], { random: mulberry32(2) });
  assert.ok(distance(p1, p2) > 0.01, "repulsion should separate coincident atoms");
});

test("embed3d is deterministic for a given random source", () => {
  const atoms = [
    { symbol: "C", x: 0, y: 0, z: 0 },
    { symbol: "O", x: 1, y: 0, z: 0 },
    { symbol: "H", x: 0, y: 1, z: 0 },
  ];
  const bonds = [
    { a: 0, b: 1, order: 1 },
    { a: 0, b: 2, order: 1 },
  ];
  const first = embed3d(atoms, bonds, { random: mulberry32(99) });
  const second = embed3d(atoms, bonds, { random: mulberry32(99) });
  assert.deepEqual(first, second);
});

test("embed3d does not mutate the input atoms array", () => {
  const atoms = [
    { symbol: "C", x: 0, y: 0, z: 0 },
    { symbol: "C", x: 1, y: 0, z: 0 },
  ];
  const bonds = [{ a: 0, b: 1, order: 1 }];
  const snapshot = JSON.parse(JSON.stringify(atoms));
  embed3d(atoms, bonds, { random: mulberry32(3) });
  assert.deepEqual(atoms, snapshot);
});

test("embed3d on an empty atom list returns an empty array without throwing", () => {
  assert.deepEqual(embed3d([], []), []);
});

test("embed3d on a single unbonded atom returns it near its original position", () => {
  const atoms = [{ symbol: "C", x: 5, y: -3, z: 0 }];
  const [p1] = embed3d(atoms, [], { random: mulberry32(4) });
  assert.ok(Math.abs(p1.x - 5) < 0.01);
  assert.ok(Math.abs(p1.y + 3) < 0.01);
});

test("embed3d shortens a double bond relative to a single bond between the same elements", () => {
  const singleAtoms = [
    { symbol: "C", x: 0, y: 0, z: 0 },
    { symbol: "C", x: 1, y: 0, z: 0 },
  ];
  const doubleAtoms = [
    { symbol: "C", x: 0, y: 0, z: 0 },
    { symbol: "C", x: 1, y: 0, z: 0 },
  ];
  const [s1, s2] = embed3d(singleAtoms, [{ a: 0, b: 1, order: 1 }], { random: mulberry32(5) });
  const [d1, d2] = embed3d(doubleAtoms, [{ a: 0, b: 1, order: 2 }], { random: mulberry32(5) });
  assert.ok(distance(d1, d2) < distance(s1, s2));
});
