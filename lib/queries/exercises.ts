import { db } from "@/lib/db";
import { exercises, workoutSets, workouts } from "@/lib/db/schema";
import type { MuscleGroup, Equipment } from "@/lib/db/schema";
import { and, asc, desc, eq, like } from "drizzle-orm";

export async function listExercises(filters?: {
  search?: string;
  muscleGroup?: MuscleGroup | "all";
  equipment?: Equipment | "all";
}) {
  const conditions = [];
  if (filters?.search) {
    conditions.push(like(exercises.name, `%${filters.search}%`));
  }
  if (filters?.muscleGroup && filters.muscleGroup !== "all") {
    conditions.push(eq(exercises.primaryMuscleGroup, filters.muscleGroup));
  }
  if (filters?.equipment && filters.equipment !== "all") {
    conditions.push(eq(exercises.equipment, filters.equipment));
  }

  const rows = await db
    .select()
    .from(exercises)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(exercises.name));
  return rows;
}

export async function getExerciseById(id: number) {
  const [row] = await db.select().from(exercises).where(eq(exercises.id, id));
  return row ?? null;
}

export async function getExerciseByIdOrThrow(id: number) {
  const row = await getExerciseById(id);
  if (!row) throw new Error(`Exercise ${id} not found`);
  return row;
}

/** All non-warmup, completed (finished-workout) sets for an exercise, most recent first. */
export async function getExerciseSetHistory(exerciseId: number, limit = 200) {
  const rows = await db
    .select({
      id: workoutSets.id,
      workoutId: workoutSets.workoutId,
      weight: workoutSets.weight,
      reps: workoutSets.reps,
      rpe: workoutSets.rpe,
      isWarmup: workoutSets.isWarmup,
      isPr: workoutSets.isPr,
      completedAt: workoutSets.completedAt,
      workoutDate: workouts.date,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
    .where(and(eq(workoutSets.exerciseId, exerciseId)))
    .orderBy(desc(workouts.date), desc(workoutSets.id))
    .limit(limit);
  return rows;
}

/** Most recent completed sets for this exercise from a *finished* workout — used for "last time" context. */
export async function getLastTimeSets(exerciseId: number, excludeWorkoutId?: number) {
  const rows = await db
    .select({
      id: workoutSets.id,
      workoutId: workoutSets.workoutId,
      setNumber: workoutSets.setNumber,
      weight: workoutSets.weight,
      reps: workoutSets.reps,
      rpe: workoutSets.rpe,
      isWarmup: workoutSets.isWarmup,
      workoutDate: workouts.date,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
    .where(eq(workoutSets.exerciseId, exerciseId))
    .orderBy(desc(workouts.date), desc(workoutSets.id))
    .limit(20);

  const filtered = excludeWorkoutId ? rows.filter((r) => r.workoutId !== excludeWorkoutId) : rows;
  if (filtered.length === 0) return null;
  const lastWorkoutId = filtered[0].workoutId;
  return filtered.filter((r) => r.workoutId === lastWorkoutId).sort((a, b) => a.setNumber - b.setNumber);
}

export async function exerciseNameLookup(): Promise<Map<number, string>> {
  const rows = await db.select({ id: exercises.id, name: exercises.name }).from(exercises);
  return new Map(rows.map((r) => [r.id, r.name]));
}

export async function isExerciseReferenced(exerciseId: number) {
  const [row] = await db.select({ id: workoutSets.id }).from(workoutSets).where(eq(workoutSets.exerciseId, exerciseId)).limit(1);
  return Boolean(row);
}
