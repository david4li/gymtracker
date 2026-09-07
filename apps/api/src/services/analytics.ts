import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExerciseAnalyticsDto,
  MuscleBalanceDto,
  MuscleGroup,
  PrDto,
  StrengthTrendPointDto,
  WeeklyVolumeDto,
} from "@gymtracker/shared";
import { setVolume } from "@gymtracker/shared/calculations/volume";
import { epley1RM, brzycki1RM } from "@gymtracker/shared/calculations/oneRepMax";
import { detectPlateau } from "@gymtracker/shared/calculations/plateau";
import { startOfISOWeek, format, subWeeks } from "date-fns";
import { fromPostgrest } from "../middleware/error.js";

/**
 * Non-warmup sets from finished workouts since a cutoff.
 *
 * The original loaded every set in the database and filtered in JS. Here the warmup flag,
 * the finished-workout condition, and the date cutoff are all pushed into the query.
 */
async function volumeSetsSince(supabase: SupabaseClient, cutoff: Date) {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("weight,reps,workouts!inner(date,finished_at),exercises!inner(primary_muscle_group)")
    .eq("is_warmup", false)
    .not("workouts.finished_at", "is", null)
    .gte("workouts.date", cutoff.toISOString());

  if (error) throw fromPostgrest(error, "Failed to load training volume");

  return (data ?? []).map((r) => {
    const row = r as unknown as {
      weight: number;
      reps: number;
      workouts: { date: string };
      exercises: { primary_muscle_group: MuscleGroup };
    };
    return {
      weight: row.weight,
      reps: row.reps,
      workoutDate: new Date(row.workouts.date),
      muscleGroup: row.exercises.primary_muscle_group,
    };
  });
}

export async function getWeeklyVolume(
  supabase: SupabaseClient,
  weeksBack = 8,
): Promise<WeeklyVolumeDto[]> {
  const cutoff = startOfISOWeek(subWeeks(new Date(), weeksBack - 1));
  const rows = await volumeSetsSince(supabase, cutoff);

  const byWeek = new Map<string, Record<string, number>>();
  for (const r of rows) {
    const key = format(startOfISOWeek(r.workoutDate), "yyyy-MM-dd");
    const bucket = byWeek.get(key) ?? {};
    bucket[r.muscleGroup] = (bucket[r.muscleGroup] ?? 0) + setVolume(r.weight, r.reps);
    byWeek.set(key, bucket);
  }

  // Emit every week in range, including empty ones, so the chart's x-axis stays continuous.
  return Array.from({ length: weeksBack }, (_, i) => {
    const weekStart = startOfISOWeek(subWeeks(new Date(), weeksBack - 1 - i));
    const key = format(weekStart, "yyyy-MM-dd");
    return {
      weekStart: key,
      weekLabel: format(weekStart, "MMM d"),
      ...(byWeek.get(key) ?? {}),
    } as WeeklyVolumeDto;
  });
}

export async function getMuscleBalance(
  supabase: SupabaseClient,
  weeksBack = 4,
): Promise<MuscleBalanceDto[]> {
  const rows = await volumeSetsSince(supabase, subWeeks(new Date(), weeksBack));

  const totals = new Map<MuscleGroup, number>();
  for (const r of rows) {
    totals.set(r.muscleGroup, (totals.get(r.muscleGroup) ?? 0) + setVolume(r.weight, r.reps));
  }

  const max = Math.max(1, ...totals.values());
  return Array.from(totals.entries())
    .map(([muscleGroup, volume]) => ({ muscleGroup, volume, relative: volume / max }))
    .sort((a, b) => b.volume - a.volume);
}

export async function getPRList(
  supabase: SupabaseClient,
  limit = 25,
): Promise<PrDto[]> {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("id,weight,reps,workout_id,exercise_id,workouts!inner(date),exercises!inner(name)")
    .eq("is_pr", true)
    .order("date", { referencedTable: "workouts", ascending: false })
    .limit(limit);

  if (error) throw fromPostgrest(error, "Failed to load personal records");

  return (data ?? [])
    .map((r) => {
      const row = r as unknown as {
        id: number;
        weight: number;
        reps: number;
        workout_id: number;
        exercise_id: number;
        workouts: { date: string };
        exercises: { name: string };
      };
      return {
        id: row.id,
        weight: row.weight,
        reps: row.reps,
        workoutId: row.workout_id,
        exerciseId: row.exercise_id,
        exerciseName: row.exercises.name,
        date: new Date(row.workouts.date).toISOString(),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Best estimated 1RM per session for one exercise, oldest first.
 *
 * Returned together with the plateau verdict because the plateau check is derived from this
 * same series; splitting them would mean two round trips computing the same thing twice.
 */
export async function getExerciseAnalytics(
  supabase: SupabaseClient,
  exerciseId: number,
): Promise<ExerciseAnalyticsDto> {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("weight,reps,workouts!inner(date)")
    .eq("exercise_id", exerciseId)
    .eq("is_warmup", false);

  if (error) throw fromPostgrest(error, "Failed to load strength trend");

  const byDate = new Map<string, { weight: number; reps: number }[]>();
  for (const r of data ?? []) {
    const row = r as unknown as {
      weight: number;
      reps: number;
      workouts: { date: string };
    };
    const key = format(new Date(row.workouts.date), "yyyy-MM-dd");
    const bucket = byDate.get(key) ?? [];
    bucket.push({ weight: row.weight, reps: row.reps });
    byDate.set(key, bucket);
  }

  const trend: StrengthTrendPointDto[] = Array.from(byDate.entries())
    .map(([date, sets]) => {
      // The session's best set is the one with the highest estimated 1RM, not the heaviest.
      let best = sets[0]!;
      let bestEpley = epley1RM(best.weight, best.reps);
      for (const s of sets) {
        const e = epley1RM(s.weight, s.reps);
        if (e > bestEpley) {
          best = s;
          bestEpley = e;
        }
      }
      return {
        date,
        epley1RM: Math.round(epley1RM(best.weight, best.reps) * 10) / 10,
        brzycki1RM: Math.round(brzycki1RM(best.weight, best.reps) * 10) / 10,
        bestWeight: best.weight,
        bestReps: best.reps,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return { trend, plateau: detectPlateau(trend.map((s) => s.epley1RM)) };
}
