/**
 * Standard atomic weights (IUPAC 2021, conventional values) for the elements
 * that show up in the overwhelming majority of drug-like and small organic
 * molecules. Extend as real-world SMILES input demands more coverage.
 */
export const ATOMIC_WEIGHTS = {
  H: 1.008,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Na: 22.99,
  Mg: 24.305,
  Si: 28.085,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Fe: 55.845,
  Zn: 65.38,
  Br: 79.904,
  I: 126.904,
};

export function atomicWeight(symbol) {
  const weight = ATOMIC_WEIGHTS[symbol];
  if (weight === undefined) {
    throw new Error(`Unknown element symbol: ${symbol}`);
  }
  return weight;
}
