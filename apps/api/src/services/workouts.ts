import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LogSetInput,
  UpdateSetInput,
  WorkoutDetailDto,
  WorkoutDto,
  WorkoutSetDto,
  WorkoutSummaryDto,
} from "@gymtracker/shared";
import { isNewPr, best1RMOf } from "@gymtracker/shared/calculations/prDetection";
import { setVolume } from "@gymtracker/shared/calculations/volume";
import { ApiError, fromPostgrest } from "../middleware/error.js";
import {
  toWorkout,
  toWorkoutSet,
  type WorkoutRow,
  type WorkoutSetRow,
} from "../mappers.js";
import { assertExercisesVisible } from "./exercises.js";

const WORKOUT_COLUMNS =
  "id,date,routine_id,notes,started_at,finished_at,duration_seconds";
const SET_COLUMNS =
  "id,workout_id,exercise_id,set_number,weight,reps,rpe,is_warmup,is_pr,group_id,completed_at";

export async function getActiveWorkout(
  supabase: SupabaseClient,
): Promise<WorkoutDto | null> {
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_COLUMNS)
    .is("finished_at", null)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load active workout");
  return data ? toWorkout(data as unknown as WorkoutRow) : null;
}

export async function getWorkout(
  supabase: SupabaseClient,
  id: number,
): Promise<WorkoutDetailDto> {
  const { data, error } = await supabase
    .from("workouts")
    .select(`${WORKOUT_COLUMNS},routines(name)`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load workout");
  if (!data) throw ApiError.notFound("workout");

  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select(`${SET_COLUMNS},exercises(name)`)
    .eq("workout_id", id)
    .order("id", { ascending: true });

  if (setsError) throw fromPostgrest(setsError, "Failed to load workout sets");

  const row = data as unknown as WorkoutRow & { routines: { name: string } | null };
  return {
    ...toWorkout(row),
    routineName: row.routines?.name ?? null,
    sets: (sets ?? []).map((s) => toWorkoutSet(s as unknown as WorkoutSetRow)),
  };
}

export async function listWorkouts(
  supabase: SupabaseClient,
  opts: { status?: "finished" | "active"; limit: number; summary: boolean },
): Promise<WorkoutDto[] | WorkoutSummaryDto[]> {
  let query = supabase
    .from("workouts")
    .select(`${WORKOUT_COLUMNS},routines(name)`)
    .order("date", { ascending: false })
    .limit(opts.limit);

  if (opts.status === "finished") query = query.not("finished_at", "is", null);
  if (opts.status === "active") query = query.is("finished_at", null);

  const { data, error } = await query;
  if (error) throw fromPostgrest(error, "Failed to list workouts");

  const rows = (data ?? []) as unknown as (WorkoutRow & {
    routines: { name: string } | null;
  })[];

  if (!opts.summary) return rows.map(toWorkout);
  if (rows.length === 0) return [];

  // Replaces the old N+1 loop: one query for every set across all listed workouts,
  // aggregated in memory.
  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("workout_id,exercise_id,weight,reps,is_warmup,is_pr")
    .in(
      "workout_id",
      rows.map((w) => w.id),
    );

  if (setsError) throw fromPostgrest(setsError, "Failed to load set summaries");

  const byWorkout = new Map<
    number,
    { volume: number; exercises: Set<number>; setCount: number; prCount: number }
  >();
  for (const raw of sets ?? []) {
    const s = raw as unknown as {
      workout_id: number;
      exercise_id: number;
      weight: number;
      reps: number;
      is_warmup: boolean;
      is_pr: boolean;
    };
    let agg = byWorkout.get(s.workout_id);
    if (!agg) {
      agg = { volume: 0, exercises: new Set(), setCount: 0, prCount: 0 };
      byWorkout.set(s.workout_id, agg);
    }
    if (!s.is_warmup) agg.volume += setVolume(s.weight, s.reps);
    agg.exercises.add(s.exercise_id);
    agg.setCount += 1;
    if (s.is_pr) agg.prCount += 1;
  }

  return rows.map((w) => {
    const agg = byWorkout.get(w.id);
    return {
      ...toWorkout(w),
      routineName: w.routines?.name ?? null,
      volume: agg?.volume ?? 0,
      exerciseCount: agg?.exercises.size ?? 0,
      setCount: agg?.setCount ?? 0,
      prCount: agg?.prCount ?? 0,
    };
  });
}

export async function startWorkout(
  supabase: SupabaseClient,
  userId: string,
  routineId: number | null,
): Promise<WorkoutDto> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      routine_id: routineId,
      date: now,
      started_at: now,
    })
    .select(WORKOUT_COLUMNS)
    .single();

  if (error) {
    // The partial unique index enforces one in-progress workout per user. Hand the client
    // the existing id so it can navigate there instead of failing.
    if (error.code === "23505") {
      const active = await getActiveWorkout(supabase);
      throw new ApiError(
        409,
        "ACTIVE_WORKOUT_EXISTS",
        "You already have a workout in progress",
        { activeWorkoutId: active?.id ?? null },
      );
    }
    throw fromPostgrest(error, "Failed to start workout");
  }
  return toWorkout(data as unknown as WorkoutRow);
}

export async function finishWorkout(
  supabase: SupabaseClient,
  id: number,
  notes: string | null,
): Promise<WorkoutDto> {
  const { data: existing, error: loadError } = await supabase
    .from("workouts")
    .select("id,started_at")
    .eq("id", id)
    .maybeSingle();

  if (loadError) throw fromPostgrest(loadError, "Failed to load workout");
  if (!existing) throw ApiError.notFound("workout");

  const finishedAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.floor((finishedAt.getTime() - new Date(existing.started_at).getTime()) / 1000),
  );

  const patch: Record<string, unknown> = {
    finished_at: finishedAt.toISOString(),
    duration_seconds: durationSeconds,
  };
  if (notes != null) patch.notes = notes;

  const { data, error } = await supabase
    .from("workouts")
    .update(patch)
    .eq("id", id)
    .select(WORKOUT_COLUMNS)
    .single();

  if (error) throw fromPostgrest(error, "Failed to finish workout");
  return toWorkout(data as unknown as WorkoutRow);
}

export async function updateWorkout(
  supabase: SupabaseClient,
  id: number,
  notes: string | null,
): Promise<WorkoutDto> {
  const { data, error } = await supabase
    .from("workouts")
    .update({ notes })
    .eq("id", id)
    .select(WORKOUT_COLUMNS)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to update workout");
  if (!data) throw ApiError.notFound("workout");
  return toWorkout(data as unknown as WorkoutRow);
}

export async function deleteWorkout(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw fromPostgrest(error, "Failed to delete workout");
}

// ---------- Sets ----------

/**
 * Logs a set and decides whether it is a personal record, using the same rule the app has
 * always used: compare its estimated 1RM against the best of every prior non-warmup set for
 * that exercise. Computed server-side so two devices cannot disagree.
 */
export async function logSet(
  supabase: SupabaseClient,
  userId: string,
  workoutId: number,
  input: LogSetInput,
): Promise<WorkoutSetDto> {
  await assertExercisesVisible(supabase, [input.exerciseId]);

  const isWarmup = input.isWarmup ?? false;
  let isPr = false;

  if (!isWarmup) {
    const { data: prior, error: priorError } = await supabase
      .from("workout_sets")
      .select("weight,reps")
      .eq("exercise_id", input.exerciseId)
      .eq("is_warmup", false);

    if (priorError) throw fromPostgrest(priorError, "Failed to check personal records");

    const priorBest = best1RMOf(
      (prior ?? []).map((s) => ({ weight: s.weight as number, reps: s.reps as number })),
    );
    isPr = isNewPr({ weight: input.weight, reps: input.reps }, priorBest);
  }

  const { data, error } = await supabase
    .from("workout_sets")
    .insert({
      user_id: userId,
      workout_id: workoutId,
      exercise_id: input.exerciseId,
      set_number: input.setNumber,
      weight: input.weight,
      reps: input.reps,
      rpe: input.rpe ?? null,
      is_warmup: isWarmup,
      is_pr: isPr,
      group_id: input.groupId ?? null,
    })
    .select(`${SET_COLUMNS},exercises(name)`)
    .single();

  if (error) throw fromPostgrest(error, "Failed to log set");
  return toWorkoutSet(data as unknown as WorkoutSetRow);
}

export async function updateSet(
  supabase: SupabaseClient,
  id: number,
  input: UpdateSetInput,
): Promise<WorkoutSetDto> {
  const patch: Record<string, unknown> = {};
  if (input.weight !== undefined) patch.weight = input.weight;
  if (input.reps !== undefined) patch.reps = input.reps;
  if (input.rpe !== undefined) patch.rpe = input.rpe ?? null;
  if (input.isWarmup !== undefined) patch.is_warmup = input.isWarmup;

  const { data, error } = await supabase
    .from("workout_sets")
    .update(patch)
    .eq("id", id)
    .select(`${SET_COLUMNS},exercises(name)`)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to update set");
  if (!data) throw ApiError.notFound("set");
  return toWorkoutSet(data as unknown as WorkoutSetRow);
}

export async function deleteSet(supabase: SupabaseClient, id: number) {
  // Idempotent: deleting an already-deleted set is not an error, matching the old no-op.
  const { error } = await supabase.from("workout_sets").delete().eq("id", id);
  if (error) throw fromPostgrest(error, "Failed to delete set");
}
