"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logSetInputSchema, type LogSetInput } from "@gymtracker/shared";
import type { WorkoutDto, WorkoutSetDto } from "@gymtracker/shared";
import { api, ApiError } from "@/lib/api/fetcher";
import { getLastTimeSets } from "@/lib/api";

export type { LogSetInput };

/**
 * A read exposed as a server function, because ActiveWorkoutClient fetches it on demand when
 * the user switches exercises rather than at render time.
 */
export async function getLastTimeForExercise(
  exerciseId: number,
  excludeWorkoutId?: number,
) {
  return getLastTimeSets(exerciseId, excludeWorkoutId);
}

export async function startWorkout(routineId?: number) {
  let workout: WorkoutDto;
  try {
    workout = await api.post<WorkoutDto>("/workouts", {
      routineId: routineId ?? null,
    });
  } catch (error) {
    // One workout in progress per user is enforced by the database. If one already exists,
    // go there instead of failing, which is what the app did before.
    if (error instanceof ApiError && error.code === "ACTIVE_WORKOUT_EXISTS") {
      const existingId = (error.details as { activeWorkoutId?: number } | undefined)
        ?.activeWorkoutId;
      if (existingId) redirect(`/workouts/${existingId}`);
    }
    throw error;
  }
  revalidatePath("/");
  redirect(`/workouts/${workout.id}`);
}

/**
 * Logs a set and returns the created row, including the server-computed isPr, because the
 * active workout screen appends the response to its local list.
 */
export async function logSet(
  input: LogSetInput & { workoutId: number },
): Promise<WorkoutSetDto> {
  const { workoutId, ...body } = input;
  const data = logSetInputSchema.parse(body);
  const created = await api.post<WorkoutSetDto>(`/workouts/${workoutId}/sets`, data);
  revalidatePath(`/workouts/${workoutId}`);
  return created;
}

export async function updateSet(input: {
  setId: number;
  weight?: number;
  reps?: number;
  rpe?: number | null;
  isWarmup?: boolean;
}) {
  const { setId, ...body } = input;
  const updated = await api.patch<WorkoutSetDto>(`/sets/${setId}`, body);
  revalidatePath(`/workouts/${updated.workoutId}`);
  return updated;
}

export async function deleteSet(setId: number) {
  await api.del(`/sets/${setId}`);
}

export async function finishWorkout(workoutId: number, notes?: string) {
  await api.post(`/workouts/${workoutId}/finish`, { notes: notes ?? null });
  revalidatePath("/");
  revalidatePath("/workouts/history");
  revalidatePath("/analytics");
  revalidatePath(`/workouts/${workoutId}`);
  redirect(`/workouts/${workoutId}`);
}

export async function cancelActiveWorkout(workoutId: number) {
  await api.del(`/workouts/${workoutId}`);
  revalidatePath("/");
  redirect("/");
}
