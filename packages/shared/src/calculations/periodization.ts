import type { PeriodizationScheme } from "../enums";

export type PeriodizationWeek = {
  week: number;
  phase: string;
  repsMin: number;
  repsMax: number;
  targetRpe: number;
  note: string;
};

/**
 * Deliberately simplified, stateless periodization calculator — generates a
 * generic week-by-week rep-range/RPE plan for a routine (applied uniformly
 * across its exercises) rather than a persisted, per-exercise auto-progression
 * engine. Good for planning at a glance, not a substitute for individualized
 * programming.
 */
export function generatePeriodizationPlan(scheme: PeriodizationScheme, weeks = 6): PeriodizationWeek[] {
  const plan: PeriodizationWeek[] = [];

  if (scheme === "linear") {
    for (let w = 1; w <= weeks; w++) {
      const isDeload = w === weeks;
      if (isDeload) {
        plan.push({ week: w, phase: "Deload", repsMin: 10, repsMax: 12, targetRpe: 5, note: "Reduce load ~30-40%, focus on recovery." });
        continue;
      }
      const progress = (w - 1) / Math.max(1, weeks - 2);
      const repsMax = Math.round(12 - progress * 6);
      const repsMin = Math.max(3, repsMax - 4);
      const targetRpe = Math.round((6 + progress * 3) * 2) / 2;
      plan.push({ week: w, phase: "Linear progression", repsMin, repsMax, targetRpe, note: "Increase weight slightly each week as reps allow." });
    }
    return plan;
  }

  if (scheme === "undulating") {
    const cycle = [
      { phase: "Heavy", repsMin: 4, repsMax: 6, targetRpe: 9, note: "Low reps, near-max effort." },
      { phase: "Moderate", repsMin: 8, repsMax: 10, targetRpe: 8, note: "Standard hypertrophy work." },
      { phase: "Light", repsMin: 12, repsMax: 15, targetRpe: 6.5, note: "Higher reps, technique focus, active recovery." },
    ];
    for (let w = 1; w <= weeks; w++) {
      const c = cycle[(w - 1) % cycle.length];
      plan.push({ week: w, ...c });
    }
    return plan;
  }

  // block
  const accumulationWeeks = Math.max(1, weeks - 3);
  for (let w = 1; w <= weeks; w++) {
    if (w <= accumulationWeeks) {
      plan.push({ week: w, phase: "Accumulation", repsMin: 10, repsMax: 15, targetRpe: 7, note: "Build volume at moderate intensity." });
    } else if (w <= accumulationWeeks + 2) {
      plan.push({ week: w, phase: "Intensification", repsMin: 5, repsMax: 8, targetRpe: 8.5, note: "Lower reps, higher intensity, reduced volume." });
    } else {
      plan.push({ week: w, phase: "Deload", repsMin: 10, repsMax: 12, targetRpe: 5, note: "Reduce load ~30-40%, focus on recovery." });
    }
  }
  return plan;
}
