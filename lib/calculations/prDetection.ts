import { epley1RM } from "./oneRepMax";

/**
 * Pure PR check: is this new set's estimated 1RM (Epley — used consistently for
 * PR detection regardless of which formula the analytics UI is displaying) higher
 * than the best 1RM seen so far for this exercise? Warm-up sets should never be
 * passed in as the candidate (callers filter those out before calling this).
 */
export function isNewPr(candidate: { weight: number; reps: number }, priorBest1RM: number | null): boolean {
  if (candidate.weight <= 0 || candidate.reps <= 0) return false;
  const candidate1RM = epley1RM(candidate.weight, candidate.reps);
  if (priorBest1RM === null) return true;
  return candidate1RM > priorBest1RM;
}

export function best1RMOf(sets: { weight: number; reps: number }[]): number | null {
  if (sets.length === 0) return null;
  return Math.max(...sets.map((s) => epley1RM(s.weight, s.reps)));
}
