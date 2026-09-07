/**
 * Estimated one-rep-max formulas. Both are well-established approximations for
 * multi-rep sets; neither is exact, especially above ~12 reps, which is why the
 * UI lets the user toggle between them rather than picking one as "the" answer.
 */
export type OneRepMaxFormula = "epley" | "brzycki";

export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function brzycki1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  // The Brzycki formula breaks down (and goes negative/infinite) at 37+ reps;
  // fall back to Epley beyond that range rather than returning nonsense.
  if (reps >= 37) return epley1RM(weight, reps);
  return (weight * 36) / (37 - reps);
}

export function estimateOneRepMax(
  weight: number,
  reps: number,
  formula: OneRepMaxFormula = "epley",
): number {
  return formula === "epley" ? epley1RM(weight, reps) : brzycki1RM(weight, reps);
}
