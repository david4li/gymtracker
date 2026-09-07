import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  RoutineDetailDto,
  RoutineInput,
  RoutineListItemDto,
} from "@gymtracker/shared";
import { ApiError, fromPostgrest } from "../middleware/error.js";
import { toRoutineExercise, type RoutineExerciseRow } from "../mappers.js";
import { assertExercisesVisible } from "./exercises.js";

const ITEM_COLUMNS =
  "id,sort_order,target_sets,target_reps_min,target_reps_max,target_rpe," +
  "rest_seconds,group_id,group_type,exercise_id,exercises(name,primary_muscle_group)";

export async function listRoutines(
  supabase: SupabaseClient,
): Promise<RoutineListItemDto[]> {
  // One query with an aggregate count, replacing the old full scan of routine_exercises
  // that was counted in JS.
  const { data, error } = await supabase
    .from("routines")
    .select("id,name,description,created_at,updated_at,routine_exercises(count)")
    .order("name", { ascending: true });

  if (error) throw fromPostgrest(error, "Failed to list routines");

  return (data ?? []).map((r) => {
    const row = r as unknown as {
      id: number;
      name: string;
      description: string | null;
      created_at: string;
      updated_at: string;
      routine_exercises: { count: number }[];
    };
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      exerciseCount: row.routine_exercises?.[0]?.count ?? 0,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  });
}

export async function getRoutine(
  supabase: SupabaseClient,
  id: number,
): Promise<RoutineDetailDto> {
  const { data, error } = await supabase
    .from("routines")
    .select(`id,name,description,created_at,updated_at,routine_exercises(${ITEM_COLUMNS})`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load routine");
  if (!data) throw ApiError.notFound("routine");

  const row = data as unknown as {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    routine_exercises: RoutineExerciseRow[];
  };

  const exercises = (row.routine_exercises ?? [])
    .map(toRoutineExercise)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    exerciseCount: exercises.length,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    exercises,
  };
}

const itemRows = (routineId: number, userId: string, input: RoutineInput) =>
  input.exercises.map((e) => ({
    user_id: userId,
    routine_id: routineId,
    exercise_id: e.exerciseId,
    sort_order: e.sortOrder,
    target_sets: e.targetSets,
    target_reps_min: e.targetRepsMin,
    target_reps_max: e.targetRepsMax,
    target_rpe: e.targetRpe ?? null,
    rest_seconds: e.restSeconds,
    group_id: e.groupId ?? null,
    group_type: e.groupType ?? null,
  }));

export async function createRoutine(
  supabase: SupabaseClient,
  userId: string,
  input: RoutineInput,
): Promise<RoutineDetailDto> {
  // Foreign keys bypass RLS, so prove the referenced exercises are visible to this caller
  // before linking to them.
  await assertExercisesVisible(
    supabase,
    input.exercises.map((e) => e.exerciseId),
  );

  const { data: routine, error } = await supabase
    .from("routines")
    .insert({ user_id: userId, name: input.name, description: input.description ?? null })
    .select("id")
    .single();

  if (error) throw fromPostgrest(error, "Failed to create routine");

  const { error: itemsError } = await supabase
    .from("routine_exercises")
    .insert(itemRows(routine.id, userId, input));

  if (itemsError) {
    // PostgREST has no transactions across statements; undo the parent so a failed insert
    // does not leave an empty routine behind.
    await supabase.from("routines").delete().eq("id", routine.id);
    throw fromPostgrest(itemsError, "Failed to save routine exercises");
  }

  return getRoutine(supabase, routine.id);
}

export async function updateRoutine(
  supabase: SupabaseClient,
  userId: string,
  id: number,
  input: RoutineInput,
): Promise<RoutineDetailDto> {
  await assertExercisesVisible(
    supabase,
    input.exercises.map((e) => e.exerciseId),
  );

  // Confirms the routine exists and belongs to the caller before anything is deleted.
  await getRoutine(supabase, id);

  const { error: updateError } = await supabase
    .from("routines")
    .update({ name: input.name, description: input.description ?? null })
    .eq("id", id);
  if (updateError) throw fromPostgrest(updateError, "Failed to update routine");

  // Full replace, matching the original delete-then-reinsert behaviour.
  const { error: deleteError } = await supabase
    .from("routine_exercises")
    .delete()
    .eq("routine_id", id);
  if (deleteError) throw fromPostgrest(deleteError, "Failed to replace routine exercises");

  const { error: insertError } = await supabase
    .from("routine_exercises")
    .insert(itemRows(id, userId, input));
  if (insertError) throw fromPostgrest(insertError, "Failed to save routine exercises");

  return getRoutine(supabase, id);
}

export async function deleteRoutine(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("routines").delete().eq("id", id);
  if (error) throw fromPostgrest(error, "Failed to delete routine");
}
