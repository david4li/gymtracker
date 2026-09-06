import { db } from "@/lib/db";
import { workouts, workoutSets, exercises, routines } from "@/lib/db/schema";
import { and, asc, desc, eq, isNull, isNotNull } from "drizzle-orm";
import { setVolume } from "@/lib/calculations/volume";

export async function getActiveWorkout() {
  const [workout] = await db.select().from(workouts).where(isNull(workouts.finishedAt)).orderBy(desc(workouts.id)).limit(1);
  return workout ?? null;
}

export async function getWorkoutWithSets(id: number) {
  const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
  if (!workout) return null;
  const routine = workout.routineId
    ? (await db.select().from(routines).where(eq(routines.id, workout.routineId)))[0]
    : null;
  const sets = await db
    .select({
      id: workoutSets.id,
      exerciseId: workoutSets.exerciseId,
      exerciseName: exercises.name,
      setNumber: workoutSets.setNumber,
      weight: workoutSets.weight,
      reps: workoutSets.reps,
      rpe: workoutSets.rpe,
      isWarmup: workoutSets.isWarmup,
      isPr: workoutSets.isPr,
      groupId: workoutSets.groupId,
      completedAt: workoutSets.completedAt,
    })
    .from(workoutSets)
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .where(eq(workoutSets.workoutId, id))
    .orderBy(asc(workoutSets.id));
  return { ...workout, routineName: routine?.name ?? null, sets };
}

export async function getWorkoutHistory(limit = 100) {
  const rows = await db
    .select()
    .from(workouts)
    .where(isNotNull(workouts.finishedAt))
    .orderBy(desc(workouts.date))
    .limit(limit);

  const results = [];
  for (const w of rows) {
    const sets = await db.select().from(workoutSets).where(eq(workoutSets.workoutId, w.id));
    const routine = w.routineId ? (await db.select().from(routines).where(eq(routines.id, w.routineId)))[0] : null;
    const volume = sets.filter((s) => !s.isWarmup).reduce((sum, s) => sum + setVolume(s.weight, s.reps), 0);
    const exerciseCount = new Set(sets.map((s) => s.exerciseId)).size;
    const prCount = sets.filter((s) => s.isPr).length;
    results.push({ ...w, routineName: routine?.name ?? null, volume, exerciseCount, setCount: sets.length, prCount });
  }
  return results;
}

export async function getRecentFinishedWorkouts(limit = 30) {
  return db.select().from(workouts).where(isNotNull(workouts.finishedAt)).orderBy(desc(workouts.date)).limit(limit);
}

export async function getMostRecentFinishedWorkout() {
  const [w] = await db.select().from(workouts).where(isNotNull(workouts.finishedAt)).orderBy(desc(workouts.date)).limit(1);
  return w ?? null;
}

/** Distinct exercises used in a workout, in first-appearance order — for the exercise switcher's "already in this workout" section. */
export async function getWorkoutExerciseIds(workoutId: number) {
  const rows = await db
    .select({ exerciseId: workoutSets.exerciseId })
    .from(workoutSets)
    .where(and(eq(workoutSets.workoutId, workoutId)))
    .orderBy(asc(workoutSets.id));
  return [...new Set(rows.map((r) => r.exerciseId))];
}
