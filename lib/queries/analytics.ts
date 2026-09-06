import { db } from "@/lib/db";
import { workoutSets, workouts, exercises } from "@/lib/db/schema";
import type { MuscleGroup } from "@/lib/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";
import { startOfISOWeek, format, subWeeks } from "date-fns";
import { setVolume } from "@/lib/calculations/volume";
import { epley1RM, brzycki1RM } from "@/lib/calculations/oneRepMax";
import { detectPlateau } from "@/lib/calculations/plateau";
import { getExerciseSetHistory } from "./exercises";

async function getNonWarmupSetsWithMuscleGroup() {
  return db
    .select({
      weight: workoutSets.weight,
      reps: workoutSets.reps,
      isWarmup: workoutSets.isWarmup,
      workoutDate: workouts.date,
      muscleGroup: exercises.primaryMuscleGroup,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .where(isNotNull(workouts.finishedAt));
}

/** Weekly training volume (weight x reps, non-warmup only) bucketed per muscle group, for a stacked bar chart. */
export async function getWeeklyVolumeByMuscleGroup(weeksBack = 8) {
  const rows = (await getNonWarmupSetsWithMuscleGroup()).filter((r) => !r.isWarmup);
  const cutoff = startOfISOWeek(subWeeks(new Date(), weeksBack - 1));

  const byWeek = new Map<string, Record<string, number>>();
  for (const r of rows) {
    const weekStart = startOfISOWeek(r.workoutDate);
    if (weekStart < cutoff) continue;
    const key = format(weekStart, "yyyy-MM-dd");
    if (!byWeek.has(key)) byWeek.set(key, {});
    const bucket = byWeek.get(key)!;
    bucket[r.muscleGroup] = (bucket[r.muscleGroup] ?? 0) + setVolume(r.weight, r.reps);
  }

  // Fill in every week in range (even empty ones) so the chart's x-axis is continuous.
  const weeks: { weekStart: string; weekLabel: string; [muscleGroup: string]: number | string }[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = startOfISOWeek(subWeeks(new Date(), i));
    const key = format(weekStart, "yyyy-MM-dd");
    weeks.push({ weekStart: key, weekLabel: format(weekStart, "MMM d"), ...(byWeek.get(key) ?? {}) });
  }
  return weeks;
}

/** Total volume per muscle group over the trailing N weeks, for the muscle-balance heatmap. */
export async function getMuscleBalance(weeksBack = 4) {
  const rows = (await getNonWarmupSetsWithMuscleGroup()).filter((r) => !r.isWarmup);
  const cutoff = subWeeks(new Date(), weeksBack);
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.workoutDate < cutoff) continue;
    totals.set(r.muscleGroup, (totals.get(r.muscleGroup) ?? 0) + setVolume(r.weight, r.reps));
  }
  const max = Math.max(1, ...totals.values());
  return Array.from(totals.entries())
    .map(([muscleGroup, volume]) => ({
      muscleGroup: muscleGroup as MuscleGroup,
      volume,
      relative: volume / max,
    }))
    .sort((a, b) => b.volume - a.volume);
}

export async function getPRList(limit = 25) {
  const rows = await db
    .select({
      id: workoutSets.id,
      weight: workoutSets.weight,
      reps: workoutSets.reps,
      workoutId: workoutSets.workoutId,
      exerciseId: workoutSets.exerciseId,
      exerciseName: exercises.name,
      date: workouts.date,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .where(eq(workoutSets.isPr, true))
    .orderBy(desc(workouts.date))
    .limit(limit);
  return rows;
}

/** Per-session strength trend for one exercise: best estimated 1RM (both formulas) per session, oldest first. */
export async function getStrengthTrend(exerciseId: number) {
  const history = (await getExerciseSetHistory(exerciseId)).filter((s) => !s.isWarmup);
  const byDate = new Map<string, typeof history>();
  for (const s of history) {
    const key = format(s.workoutDate, "yyyy-MM-dd");
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(s);
  }
  const sessions = Array.from(byDate.entries())
    .map(([dateKey, sets]) => {
      let best = sets[0];
      let bestEpley = epley1RM(best.weight, best.reps);
      for (const s of sets) {
        const e = epley1RM(s.weight, s.reps);
        if (e > bestEpley) {
          best = s;
          bestEpley = e;
        }
      }
      return {
        date: dateKey,
        epley1RM: Math.round(epley1RM(best.weight, best.reps) * 10) / 10,
        brzycki1RM: Math.round(brzycki1RM(best.weight, best.reps) * 10) / 10,
        bestWeight: best.weight,
        bestReps: best.reps,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  return sessions;
}

export async function getPlateauStatus(exerciseId: number) {
  const trend = await getStrengthTrend(exerciseId);
  return detectPlateau(trend.map((s) => s.epley1RM));
}
