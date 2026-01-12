export const computePriority = (temp, vib, pastFailures) => {
  let score = temp * 0.4 + vib * 10 * 0.4 + pastFailures * 10 * 0.2;

  if (score > 80) return "high";
  if (score > 50) return "medium";
  return "low";
};
