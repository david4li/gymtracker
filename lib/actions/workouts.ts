"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workouts, workoutSets } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { isNewPr, best1RMOf } from "@/lib/calculations/prDetection";
import { getActiveWorkout } from "@/lib/queries/workouts";
import { getLastTimeSets } from "@/lib/queries/exercises";

/** Read, exposed as a Server Function so the active-workout client component can call it on demand as the user switches exercises. */
export async function getLastTimeForExercise(exerciseId: number, excludeWorkoutId?: number) {
  return getLastTimeSets(exerciseId, excludeWorkoutId);
}

async function bestPriorOneRepMax(exerciseId: number, excludeWorkoutId?: number) {
  const rows = await db
    .select({ weight: workoutSets.weight, reps: workoutSets.reps, workoutId: workoutSets.workoutId })
    .from(workoutSets)
    .where(and(eq(workoutSets.exerciseId, exerciseId), eq(workoutSets.isWarmup, false)));
  const filtered = excludeWorkoutId ? rows.filter((r) => r.workoutId !== excludeWorkoutId) : rows;
  return best1RMOf(filtered);
}

export async function startWorkout(routineId?: number) {
  const existing = await getActiveWorkout();
  if (existing) {
    redirect(`/workouts/${existing.id}`);
  }
  const [row] = await db.insert(workouts).values({ routineId: routineId ?? null }).returning();
  revalidatePath("/workouts/active");
  redirect(`/workouts/${row.id}`);
}

const logSetSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
  setNumber: z.number().int().positive(),
  weight: z.number().min(0).max(3000),
  reps: z.number().int().min(0).max(1000),
  rpe: z.number().min(1).max(10).optional(),
  isWarmup: z.boolean().default(false),
  groupId: z.string().optional(),
});
export type LogSetInput = z.input<typeof logSetSchema>;

export async function logSet(input: LogSetInput) {
  const data = logSetSchema.parse(input);
  const priorBest = data.isWarmup ? null : await bestPriorOneRepMax(data.exerciseId, undefined);
  const isPr = !data.isWarmup && isNewPr({ weight: data.weight, reps: data.reps }, priorBest);

  const [row] = await db
    .insert(workoutSets)
    .values({
      workoutId: data.workoutId,
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      weight: data.weight,
      reps: data.reps,
      rpe: data.rpe,
      isWarmup: data.isWarmup,
      groupId: data.groupId,
      isPr,
    })
    .returning();

  revalidatePath(`/workouts/${data.workoutId}`);
  return row;
}

const updateSetSchema = z.object({
  setId: z.number().int().positive(),
  weight: z.number().min(0).max(3000).optional(),
  reps: z.number().int().min(0).max(1000).optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  isWarmup: z.boolean().optional(),
});

export async function updateSet(input: z.input<typeof updateSetSchema>) {
  const data = updateSetSchema.parse(input);
  const [existing] = await db.select().from(workoutSets).where(eq(workoutSets.id, data.setId));
  if (!existing) throw new Error("Set not found");

  const { setId, ...patch } = data;
  await db.update(workoutSets).set(patch).where(eq(workoutSets.id, setId));
  revalidatePath(`/workouts/${existing.workoutId}`);
}

export async function deleteSet(setId: number) {
  const [existing] = await db.select().from(workoutSets).where(eq(workoutSets.id, setId));
  if (!existing) return;
  await db.delete(workoutSets).where(eq(workoutSets.id, setId));
  revalidatePath(`/workouts/${existing.workoutId}`);
}

export async function finishWorkout(workoutId: number, notes?: string) {
  const [workout] = await db.select().from(workouts).where(eq(workouts.id, workoutId));
  if (!workout) throw new Error("Workout not found");

  const durationSeconds = Math.max(0, Math.round((Date.now() - workout.startedAt.getTime()) / 1000));
  await db
    .update(workouts)
    .set({ finishedAt: new Date(), durationSeconds, notes: notes ?? workout.notes })
    .where(eq(workouts.id, workoutId));

  revalidatePath("/workouts/active");
  revalidatePath("/workouts/history");
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/");
  redirect(`/workouts/${workoutId}`);
}

/** Abandon an in-progress workout entirely (cascades to its sets). */
export async function cancelActiveWorkout(workoutId: number) {
  await db.delete(workouts).where(and(eq(workouts.id, workoutId)));
  revalidatePath("/workouts/active");
  revalidatePath("/");
  redirect("/workouts/active");
}
