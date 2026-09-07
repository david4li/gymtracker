import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type {
  exerciseInputSchema,
  exerciseUpdateSchema,
  exerciseQuerySchema,
} from "@gymtracker/shared";
import { ApiError, fromPostgrest } from "../middleware/error.js";
import {
  toExercise,
  toExerciseSetHistory,
  toLastTimeSet,
  type ExerciseRow,
} from "../mappers.js";

const COLUMNS =
  "id,user_id,name,primary_muscle_group,secondary_muscle_groups,equipment,notes,video_url,created_at";

/**
 * Guards against the one hole row-level security does not close: foreign key checks bypass
 * RLS, so a request could reference another user's private exercise and Postgres would accept
 * it. Re-selecting the ids through the caller's own client proves they are visible first.
 *
 * Must be called before any insert carrying an exercise_id.
 */
export async function assertExercisesVisible(
  supabase: SupabaseClient,
  ids: number[],
): Promise<void> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return;

  const { data, error } = await supabase
    .from("exercises")
    .select("id")
    .in("id", unique);

  if (error) throw fromPostgrest(error, "Failed to verify exercises");

  const found = new Set((data ?? []).map((r) => r.id as number));
  const missing = unique.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new ApiError(
      400,
      "UNKNOWN_EXERCISE",
      "One or more exercises do not exist or are not available to you",
      { exerciseIds: missing },
    );
  }
}

export async function listExercises(
  supabase: SupabaseClient,
  filters: z.infer<typeof exerciseQuerySchema>,
) {
  let query = supabase.from("exercises").select(COLUMNS);

  if (filters.search) {
    // Substring match, served by the pg_trgm GIN index. Escape the LIKE wildcards so a
    // literal % or _ in the search box does not turn into a pattern.
    const escaped = filters.search.replace(/[%_\\]/g, "\\$&");
    query = query.ilike("name", `%${escaped}%`);
  }
  if (filters.muscleGroup) {
    query = query.eq("primary_muscle_group", filters.muscleGroup);
  }
  if (filters.equipment) {
    query = query.eq("equipment", filters.equipment);
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw fromPostgrest(error, "Failed to list exercises");
  return (data as unknown as ExerciseRow[]).map(toExercise);
}

export async function getExercise(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase
    .from("exercises")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load exercise");
  if (!data) throw ApiError.notFound("exercise");
  return toExercise(data as unknown as ExerciseRow);
}

export async function createExercise(
  supabase: SupabaseClient,
  userId: string,
  input: z.infer<typeof exerciseInputSchema>,
) {
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: userId,
      name: input.name,
      primary_muscle_group: input.primaryMuscleGroup,
      secondary_muscle_groups: input.secondaryMuscleGroups,
      equipment: input.equipment,
      notes: input.notes ?? null,
      video_url: input.videoUrl ?? null,
    })
    .select(COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        "EXERCISE_NAME_TAKEN",
        "You already have an exercise with that name",
      );
    }
    throw fromPostgrest(error, "Failed to create exercise");
  }
  return toExercise(data as unknown as ExerciseRow);
}

/** Global catalog rows belong to no one and cannot be edited or deleted by a user. */
async function assertOwned(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase
    .from("exercises")
    .select("id,user_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load exercise");
  if (!data) throw ApiError.notFound("exercise");
  if (data.user_id === null) {
    throw new ApiError(
      403,
      "EXERCISE_IS_GLOBAL",
      "This is a built-in exercise. Duplicate it to make your own version.",
    );
  }
}

export async function updateExercise(
  supabase: SupabaseClient,
  id: number,
  input: z.infer<typeof exerciseUpdateSchema>,
) {
  await assertOwned(supabase, id);

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.primaryMuscleGroup !== undefined)
    patch.primary_muscle_group = input.primaryMuscleGroup;
  if (input.secondaryMuscleGroups !== undefined)
    patch.secondary_muscle_groups = input.secondaryMuscleGroups;
  if (input.equipment !== undefined) patch.equipment = input.equipment;
  if (input.notes !== undefined) patch.notes = input.notes ?? null;
  if (input.videoUrl !== undefined) patch.video_url = input.videoUrl ?? null;

  if (Object.keys(patch).length === 0) return getExercise(supabase, id);

  const { data, error } = await supabase
    .from("exercises")
    .update(patch)
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        "EXERCISE_NAME_TAKEN",
        "You already have an exercise with that name",
      );
    }
    throw fromPostgrest(error, "Failed to update exercise");
  }
  return toExercise(data as unknown as ExerciseRow);
}

export async function deleteExercise(supabase: SupabaseClient, id: number) {
  await assertOwned(supabase, id);

  // Preserve the existing behaviour: an exercise with logged sets cannot be deleted, because
  // workout history would lose its meaning. The database's ON DELETE RESTRICT would also
  // catch this, but checking first produces a message worth showing a user.
  const { data: referencing, error: refError } = await supabase
    .from("workout_sets")
    .select("id")
    .eq("exercise_id", id)
    .limit(1);

  if (refError) throw fromPostgrest(refError, "Failed to check exercise usage");
  if (referencing && referencing.length > 0) {
    throw new ApiError(
      409,
      "EXERCISE_IN_USE",
      "This exercise has logged sets and cannot be deleted",
    );
  }

  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) throw fromPostgrest(error, "Failed to delete exercise");
}

export async function getExerciseSetHistory(
  supabase: SupabaseClient,
  exerciseId: number,
  limit = 200,
) {
  const { data, error } = await supabase
    .from("workout_sets")
    .select(
      "id,workout_id,weight,reps,rpe,is_warmup,is_pr,completed_at,workouts!inner(date)",
    )
    .eq("exercise_id", exerciseId)
    .order("date", { referencedTable: "workouts", ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) throw fromPostgrest(error, "Failed to load set history");

  return (data ?? []).map((r) => {
    const row = r as unknown as {
      id: number;
      workout_id: number;
      weight: number;
      reps: number;
      rpe: number | null;
      is_warmup: boolean;
      is_pr: boolean;
      completed_at: string;
      workouts: { date: string };
    };
    return toExerciseSetHistory({ ...row, workout_date: row.workouts.date });
  });
}

/**
 * The sets from the most recent workout that used this exercise, for the "last time" card.
 * Fetches a window and narrows to a single workout in JS, matching the original behaviour.
 */
export async function getLastTimeSets(
  supabase: SupabaseClient,
  exerciseId: number,
  excludeWorkoutId?: number,
) {
  const { data, error } = await supabase
    .from("workout_sets")
    .select(
      "id,workout_id,set_number,weight,reps,rpe,is_warmup,workouts!inner(date)",
    )
    .eq("exercise_id", exerciseId)
    .order("date", { referencedTable: "workouts", ascending: false })
    .order("id", { ascending: false })
    .limit(20);

  if (error) throw fromPostgrest(error, "Failed to load last session");

  const rows = (data ?? []).map((r) => {
    const row = r as unknown as {
      id: number;
      workout_id: number;
      set_number: number;
      weight: number;
      reps: number;
      rpe: number | null;
      is_warmup: boolean;
      workouts: { date: string };
    };
    return { ...row, workout_date: row.workouts.date };
  });

  const filtered = excludeWorkoutId
    ? rows.filter((r) => r.workout_id !== excludeWorkoutId)
    : rows;

  if (filtered.length === 0) return null;

  const lastWorkoutId = filtered[0]!.workout_id;
  return filtered
    .filter((r) => r.workout_id === lastWorkoutId)
    .sort((a, b) => a.set_number - b.set_number)
    .map(toLastTimeSet);
}
