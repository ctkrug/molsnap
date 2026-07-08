import { atomicWeight } from "./periodicTable.js";

/**
 * Renders an atom-count map as a Hill-system formula string: carbon first,
 * then hydrogen, then every other element alphabetically. Molecules with no
 * carbon are ordered purely alphabetically (hydrogen included).
 *
 * @param {Record<string, number>} atomCounts e.g. { C: 9, H: 8, O: 4 }
 * @returns {string} e.g. "C9H8O4"
 */
export function toHillFormula(atomCounts) {
  const symbols = Object.keys(atomCounts).filter((s) => atomCounts[s] > 0);
  const hasCarbon = symbols.includes("C");

  const order = hasCarbon
    ? [
        "C",
        "H",
        ...symbols.filter((s) => s !== "C" && s !== "H").sort(),
      ].filter((s) => symbols.includes(s))
    : symbols.slice().sort();

  return order
    .map((symbol) => {
      const count = atomCounts[symbol];
      return count === 1 ? symbol : `${symbol}${count}`;
    })
    .join("");
}

/**
 * Sums atomic weights across an atom-count map to get the molecular weight.
 *
 * @param {Record<string, number>} atomCounts
 * @returns {number} molecular weight in g/mol
 */
export function molecularWeight(atomCounts) {
  return Object.entries(atomCounts).reduce(
    (total, [symbol, count]) => total + atomicWeight(symbol) * count,
    0
  );
}
