const SINGLE_BOND_LENGTHS = {
  "C-C": 1.54,
  "C-H": 1.09,
  "C-N": 1.47,
  "C-O": 1.43,
  "C-S": 1.82,
  "C-F": 1.35,
  "C-Cl": 1.77,
  "C-Br": 1.94,
  "C-I": 2.14,
  "N-H": 1.01,
  "N-N": 1.45,
  "N-O": 1.4,
  "O-H": 0.96,
  "O-O": 1.48,
  "S-H": 1.34,
};

const MULTI_BOND_SCALE = {
  1: 1,
  2: 0.87,
  3: 0.78,
  4: 0.9,
};

const DEFAULT_SINGLE_BOND_LENGTH = 1.5;

function pairKey(symbolA, symbolB) {
  return [symbolA, symbolB].sort().join("-");
}

/**
 * Approximate equilibrium bond length in Angstroms for a pair of elements at
 * a given bond order. Order 4 represents an aromatic bond. Unknown element
 * pairs fall back to a generic single-bond length so the 3D embedder always
 * has a target to relax toward.
 */
export function idealBondLength(symbolA, symbolB, order = 1) {
  const base = SINGLE_BOND_LENGTHS[pairKey(symbolA, symbolB)] ?? DEFAULT_SINGLE_BOND_LENGTH;
  const scale = MULTI_BOND_SCALE[order] ?? MULTI_BOND_SCALE[1];
  return base * scale;
}
