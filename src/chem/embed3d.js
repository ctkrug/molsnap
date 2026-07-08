import { idealBondLength } from "./bondLengths.js";

const DEFAULT_ITERATIONS = 300;
const SPRING_STRENGTH = 0.4;
const REPULSION_STRENGTH = 0.02;
const REPULSION_CUTOFF = 4;
const INITIAL_Z_JITTER = 0.6;

/**
 * Generates plausible 3D coordinates for a bonded set of atoms via a simple
 * distance-geometry relaxation: bonds act as springs pulling pairs toward
 * their ideal length, and every non-bonded pair repels, which lifts the flat
 * 2D layout RDKit provides into a spinnable 3D shape. This is a lightweight
 * approximation, not a real ETKDG embedding (the installed RDKit WASM build
 * doesn't expose conformer generation — see docs/ARCHITECTURE.md).
 *
 * @param {Array<{symbol: string, x: number, y: number, z?: number}>} atoms
 * @param {Array<{a: number, b: number, order: number}>} bonds
 * @param {{ iterations?: number, random?: () => number }} [options]
 * @returns {Array<{symbol: string, x: number, y: number, z: number}>} new
 *          atom objects with relaxed 3D coordinates; input is not mutated
 */
export function embed3d(atoms, bonds, options = {}) {
  const { iterations = DEFAULT_ITERATIONS, random = Math.random } = options;

  if (atoms.length === 0) {
    return [];
  }

  const positions = atoms.map((atom) => ({
    x: atom.x,
    y: atom.y,
    z: (random() - 0.5) * INITIAL_Z_JITTER,
  }));

  const bonded = new Set(bonds.map((bond) => `${Math.min(bond.a, bond.b)}-${Math.max(bond.a, bond.b)}`));
  const n = positions.length;

  for (let step = 0; step < iterations; step += 1) {
    const forces = positions.map(() => ({ x: 0, y: 0, z: 0 }));

    for (const bond of bonds) {
      const p1 = positions[bond.a];
      const p2 = positions[bond.b];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const target = idealBondLength(atoms[bond.a].symbol, atoms[bond.b].symbol, bond.order);
      const diff = ((dist - target) / dist) * SPRING_STRENGTH;

      forces[bond.a].x += dx * diff;
      forces[bond.a].y += dy * diff;
      forces[bond.a].z += dz * diff;
      forces[bond.b].x -= dx * diff;
      forces[bond.b].y -= dy * diff;
      forces[bond.b].z -= dz * diff;
    }

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        if (bonded.has(`${i}-${j}`)) continue;

        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dz = positions[j].z - positions[i].z;
        const distSq = dx * dx + dy * dy + dz * dz || 1e-4;
        const dist = Math.sqrt(distSq);
        if (dist > REPULSION_CUTOFF) continue;

        const strength = REPULSION_STRENGTH / distSq;
        const fx = (dx / dist) * strength;
        const fy = (dy / dist) * strength;
        const fz = (dz / dist) * strength;

        forces[j].x += fx;
        forces[j].y += fy;
        forces[j].z += fz;
        forces[i].x -= fx;
        forces[i].y -= fy;
        forces[i].z -= fz;
      }
    }

    for (let i = 0; i < n; i += 1) {
      positions[i].x += forces[i].x;
      positions[i].y += forces[i].y;
      positions[i].z += forces[i].z;
    }
  }

  return atoms.map((atom, i) => ({
    ...atom,
    x: positions[i].x,
    y: positions[i].y,
    z: positions[i].z,
  }));
}
