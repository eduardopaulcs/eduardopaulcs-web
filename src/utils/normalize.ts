/**
 * Normalizes a string to lowercase with accents removed for comparison.
 */
const normalize = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default normalize;
