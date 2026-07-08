export const MAX_SMILES_LENGTH = 500;

/**
 * @param {string} smiles
 * @returns {boolean} true if the string is too long to hand to the parser
 */
export function isTooLong(smiles) {
  return smiles.length > MAX_SMILES_LENGTH;
}
