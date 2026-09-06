import { subDays } from "date-fns";
import { db } from "./index";
import { exercises, routines, routineExercises, workouts, workoutSets, bodyStats, settings } from "./schema";
import { exerciseSeedData } from "./seed-data/exercises";
import { routineSeedData } from "./seed-data/routines";
import { workoutSeedData } from "./seed-data/workouts";
import { bodyStatSeedData } from "./seed-data/bodyStats";
import { isNewPr } from "@/lib/calculations/prDetection";
import { epley1RM } from "@/lib/calculations/oneRepMax";

async function seedExercises() {
  for (const exercise of exerciseSeedData) {
    await db.insert(exercises).values(exercise).onConflictDoNothing({ target: exercises.name });
  }
  const all = await db.select().from(exercises);
  const byName = new Map(all.map((e) => [e.name, e]));
  console.log(`Exercises: ${all.length} present (${exerciseSeedData.length} in seed data).`);
  return byName;
}

async function seedRoutines(exerciseByName: Map<string, { id: number }>) {
  const existing = await db.select().from(routines);
  if (existing.length > 0) {
    console.log(`Routines: ${existing.length} already present, skipping.`);
    return;
  }
  for (const routine of routineSeedData) {
    const [row] = await db.insert(routines).values({ name: routine.name, description: routine.description }).returning();
    for (const re of routine.exercises) {
      const exercise = exerciseByName.get(re.exerciseName);
      if (!exercise) {
        console.warn(`  Skipping routine exercise "${re.exerciseName}" — not found in exercise library.`);
        continue;
      }
      await db.insert(routineExercises).values({
        routineId: row.id,
        exerciseId: exercise.id,
        order: re.order,
        targetSets: re.targetSets,
        targetRepsMin: re.targetRepsMin,
        targetRepsMax: re.targetRepsMax,
        targetRpe: re.targetRpe,
        restSeconds: re.restSeconds,
      });
    }
  }
  console.log(`Routines: inserted ${routineSeedData.length}.`);
}

async function seedWorkouts(exerciseByName: Map<string, { id: number }>) {
  const existing = await db.select().from(workouts);
  if (existing.length > 0) {
    console.log(`Workouts: ${existing.length} already present, skipping.`);
    return;
  }
  const routineByName = new Map((await db.select().from(routines)).map((r) => [r.name, r]));
  // Track the best-1RM-so-far per exercise as we insert workouts in chronological
  // order, mirroring exactly how the real logSet Server Action computes isPr.
  const bestSoFar = new Map<number, number>();

  const chronological = [...workoutSeedData].sort((a, b) => b.daysAgo - a.daysAgo);
  for (const w of chronological) {
    const date = subDays(new Date(), w.daysAgo);
    const routine = routineByName.get(w.routineName);
    const [workoutRow] = await db
      .insert(workouts)
      .values({
        date,
        startedAt: date,
        finishedAt: new Date(date.getTime() + w.durationSeconds * 1000),
        durationSeconds: w.durationSeconds,
        routineId: routine?.id,
        notes: w.notes,
      })
      .returning();

    for (const s of w.sets) {
      const exercise = exerciseByName.get(s.exerciseName);
      if (!exercise) {
        console.warn(`  Skipping set for "${s.exerciseName}" — not found in exercise library.`);
        continue;
      }
      const isWarmup = s.isWarmup ?? false;
      const priorBest = bestSoFar.get(exercise.id) ?? null;
      const isPr = !isWarmup && isNewPr({ weight: s.weight, reps: s.reps }, priorBest);
      if (!isWarmup) {
        const this1RM = epley1RM(s.weight, s.reps);
        bestSoFar.set(exercise.id, Math.max(priorBest ?? 0, this1RM));
      }
      await db.insert(workoutSets).values({
        workoutId: workoutRow.id,
        exerciseId: exercise.id,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        isWarmup,
        isPr,
        completedAt: date,
      });
    }
  }
  console.log(`Workouts: inserted ${workoutSeedData.length}.`);
}

async function seedBodyStats() {
  const existing = await db.select().from(bodyStats);
  if (existing.length > 0) {
    console.log(`Body stats: ${existing.length} already present, skipping.`);
    return;
  }
  for (const stat of bodyStatSeedData) {
    await db.insert(bodyStats).values({
      date: subDays(new Date(), stat.daysAgo),
      weightKg: stat.weightKg,
      measurements: stat.measurements,
      notes: stat.notes,
    });
  }
  console.log(`Body stats: inserted ${bodyStatSeedData.length}.`);
}

async function seedSettings() {
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing({ target: settings.id });
  console.log("Settings: default row ensured.");
}

async function main() {
  console.log("Seeding database...");
  const exerciseByName = await seedExercises();
  await seedRoutines(exerciseByName);
  await seedWorkouts(exerciseByName);
  await seedBodyStats();
  await seedSettings();
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
