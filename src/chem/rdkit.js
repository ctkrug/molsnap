/**
 * Thin glue around the RDKit WASM module. `RDKit_minimal.js` is loaded via a
 * classic <script> tag (see src/index.html) rather than bundled, because its
 * Emscripten glue code branches on Node's `require("fs")` in a way esbuild
 * can't tree-shake for a browser target — see docs/ARCHITECTURE.md.
 */

/**
 * @returns {Promise<import("@rdkit/rdkit").RDKitModule>}
 */
export function loadRDKit() {
  if (typeof window === "undefined" || typeof window.initRDKitModule !== "function") {
    return Promise.reject(
      new Error("RDKit_minimal.js was not found on the page — is the script tag missing?")
    );
  }
  return window.initRDKitModule({
    locateFile: () => "./RDKit_minimal.wasm",
  });
}

/**
 * Parses a SMILES string with RDKit and returns its all-explicit-hydrogens
 * molblock, which is the shared source of truth for the 2D layout's atom
 * accounting, the formula/weight readout, and the 3D embedder.
 *
 * @param {import("@rdkit/rdkit").RDKitModule} RDKitModule
 * @param {string} smiles
 * @returns {{ valid: true, molblock: string } | { valid: false }}
 */
export function analyzeSmiles(RDKitModule, smiles) {
  const mol = RDKitModule.get_mol(smiles);
  if (!mol) {
    return { valid: false };
  }
  try {
    return { valid: true, molblock: mol.add_hs() };
  } finally {
    mol.delete();
  }
}
