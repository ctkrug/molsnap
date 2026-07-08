/**
 * Minimal V2000 molfile reader/writer. Only the counts line, atom block, and
 * bond block are handled — enough to round-trip atom positions and bond
 * connectivity between RDKit and the 3D embedder without pulling in a full
 * chemistry file-format library.
 */

function parseCountsLine(line) {
  const numAtoms = Number.parseInt(line.slice(0, 3), 10) || 0;
  const numBonds = Number.parseInt(line.slice(3, 6), 10) || 0;
  return { numAtoms, numBonds };
}

/**
 * @param {string} molblock V2000 molfile text
 * @returns {{ atoms: Array<{symbol: string, x: number, y: number, z: number}>,
 *             bonds: Array<{a: number, b: number, order: number}> }}
 *          bonds reference atoms by 0-based index into the returned atoms array
 */
export function parseMolblock(molblock) {
  const lines = molblock.split("\n");
  const { numAtoms, numBonds } = parseCountsLine(lines[3] ?? "");

  const atoms = [];
  for (let i = 0; i < numAtoms; i += 1) {
    const line = lines[4 + i] ?? "";
    const [x, y, z, symbol] = line.trim().split(/\s+/);
    atoms.push({ symbol, x: Number(x), y: Number(y), z: Number(z) });
  }

  const bonds = [];
  for (let i = 0; i < numBonds; i += 1) {
    const line = lines[4 + numAtoms + i] ?? "";
    const [a, b, order] = line.trim().split(/\s+/).map(Number);
    bonds.push({ a: a - 1, b: b - 1, order });
  }

  return { atoms, bonds };
}

function padNumber(value, width) {
  return value.toFixed(4).padStart(width, " ");
}

function padCount(value) {
  return String(value).padStart(3, " ");
}

/**
 * Serializes atoms + bonds back into a minimal V2000 molfile, e.g. after the
 * 3D embedder has updated atom coordinates. Bond order 4 (aromatic) is
 * written as 4, which 3Dmol.js and most viewers accept as a query bond type.
 *
 * @param {Array<{symbol: string, x: number, y: number, z: number}>} atoms
 * @param {Array<{a: number, b: number, order: number}>} bonds
 * @returns {string}
 */
export function toMolblock(atoms, bonds) {
  const counts = `${padCount(atoms.length)}${padCount(bonds.length)}  0  0  0  0  0  0  0  0999 V2000`;

  const atomLines = atoms.map(
    (atom) =>
      `${padNumber(atom.x, 10)}${padNumber(atom.y, 10)}${padNumber(atom.z, 10)} ${atom.symbol.padEnd(3, " ")} 0  0  0  0  0  0  0  0  0  0  0  0`
  );

  const bondLines = bonds.map(
    (bond) => `${padCount(bond.a + 1)}${padCount(bond.b + 1)}${padCount(bond.order)}  0`
  );

  return [
    "",
    "     molsnap",
    "",
    counts,
    ...atomLines,
    ...bondLines,
    "M  END",
    "",
  ].join("\n");
}

/**
 * @param {Array<{symbol: string}>} atoms
 * @returns {Record<string, number>} element symbol -> count
 */
export function atomCountsFromAtoms(atoms) {
  const counts = {};
  for (const atom of atoms) {
    counts[atom.symbol] = (counts[atom.symbol] ?? 0) + 1;
  }
  return counts;
}
