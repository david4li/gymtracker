import { notFound } from "next/navigation";
import { getWorkoutWithSets } from "@/lib/queries/workouts";
import { listExercises } from "@/lib/queries/exercises";
import { getRoutineWithExercises } from "@/lib/queries/routines";
import { getSettings } from "@/lib/queries/settings";
import { ActiveWorkoutClient } from "@/components/workout/ActiveWorkoutClient";
import { WorkoutSummary } from "@/components/workout/WorkoutSummary";

export default async function WorkoutPage({ params }: PageProps<"/workouts/[id]">) {
  const { id } = await params;
  const workoutId = Number(id);
  const workout = await getWorkoutWithSets(workoutId);
  if (!workout) notFound();

  const settings = await getSettings();

  if (workout.finishedAt) {
    return (
      <WorkoutSummary
        routineName={workout.routineName}
        date={workout.date}
        durationSeconds={workout.durationSeconds}
        notes={workout.notes}
        sets={workout.sets}
        unit={settings.weightUnit}
      />
    );
  }

  const [allExercises, routine] = await Promise.all([
    listExercises(),
    workout.routineId ? getRoutineWithExercises(workout.routineId) : null,
  ]);

  const routineTargets =
    routine?.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      targetSets: ex.targetSets,
      targetRepsMin: ex.targetRepsMin,
      targetRepsMax: ex.targetRepsMax,
      restSeconds: ex.restSeconds,
    })) ?? [];

  return (
    <ActiveWorkoutClient
      workoutId={workout.id}
      startedAt={workout.startedAt}
      routineName={workout.routineName}
      initialSets={workout.sets}
      allExercises={allExercises}
      routineTargets={routineTargets}
      defaultRestSeconds={settings.defaultRestSeconds}
      unit={settings.weightUnit}
    />
  );
}
