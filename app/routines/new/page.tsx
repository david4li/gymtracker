import { listExercises } from "@/lib/queries/exercises";
import { RoutineForm } from "@/components/routines/RoutineForm";
import { createRoutine } from "@/lib/actions/routines";

export default async function NewRoutinePage() {
  const exercises = await listExercises();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">New Routine</h1>
      <RoutineForm exercises={exercises} submit={createRoutine} submitLabel="Create routine" />
    </div>
  );
}
