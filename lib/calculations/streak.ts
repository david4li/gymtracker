import { startOfWeek, subWeeks, isEqual } from "date-fns";

/**
 * Current streak in consecutive calendar weeks (Mon-Sun) that have at least one
 * workout, counting back from the current week. Week-based rather than day-based
 * since most training splits include planned rest days.
 */
export function weeklyWorkoutStreak(workoutDates: Date[], today: Date = new Date()): number {
  const weekStarts = new Set(
    workoutDates.map((d) => startOfWeek(d, { weekStartsOn: 1 }).getTime()),
  );
  let streak = 0;
  let cursor = startOfWeek(today, { weekStartsOn: 1 });
  while (weekStarts.has(cursor.getTime())) {
    streak++;
    cursor = subWeeks(cursor, 1);
  }
  return streak;
}

/** Unused helper kept for symmetry/tests: true if two dates fall in the same week. */
export function sameWeek(a: Date, b: Date): boolean {
  return isEqual(startOfWeek(a, { weekStartsOn: 1 }), startOfWeek(b, { weekStartsOn: 1 }));
}
