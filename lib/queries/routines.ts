import { db } from "@/lib/db";
import { routines, routineExercises, exercises } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function listRoutines() {
  const rows = await db.select().from(routines).orderBy(asc(routines.name));
  const counts = await db
    .select({ routineId: routineExercises.routineId })
    .from(routineExercises);
  const countByRoutine = new Map<number, number>();
  for (const c of counts) countByRoutine.set(c.routineId, (countByRoutine.get(c.routineId) ?? 0) + 1);
  return rows.map((r) => ({ ...r, exerciseCount: countByRoutine.get(r.id) ?? 0 }));
}

export async function getRoutineWithExercises(id: number) {
  const [routine] = await db.select().from(routines).where(eq(routines.id, id));
  if (!routine) return null;
  const items = await db
    .select({
      id: routineExercises.id,
      order: routineExercises.order,
      targetSets: routineExercises.targetSets,
      targetRepsMin: routineExercises.targetRepsMin,
      targetRepsMax: routineExercises.targetRepsMax,
      targetRpe: routineExercises.targetRpe,
      restSeconds: routineExercises.restSeconds,
      groupId: routineExercises.groupId,
      groupType: routineExercises.groupType,
      exerciseId: routineExercises.exerciseId,
      exerciseName: exercises.name,
      primaryMuscleGroup: exercises.primaryMuscleGroup,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
    .where(eq(routineExercises.routineId, id))
    .orderBy(asc(routineExercises.order));
  return { ...routine, exercises: items };
}

export async function listRoutinesForSelect() {
  return db.select({ id: routines.id, name: routines.name }).from(routines).orderBy(asc(routines.name));
}
