export const computeRiskScore = (row) => {
  let score = 0;

  if (row.temperature > 80) score += 30;
  if (row.vibration > 7) score += 30;
  if (row.power > 12) score += 20;
  if (row.runtime > 8) score += 20;

  return Math.min(score, 100);
};

export const computePriority = (risk) => {
  if (risk >= 70) return "high";
  if (risk >= 40) return "medium";
  return "low";
};
