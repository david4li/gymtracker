import { notFound } from "next/navigation";
import { getRoutineWithExercises } from "@/lib/queries/routines";
import { listExercises } from "@/lib/queries/exercises";
import { RoutineForm } from "@/components/routines/RoutineForm";
import { updateRoutine, deleteRoutine } from "@/lib/actions/routines";
import { Button } from "@/components/ui/Button";

export default async function EditRoutinePage({ params }: PageProps<"/routines/[id]/edit">) {
  const { id } = await params;
  const routineId = Number(id);
  const [routine, exercises] = await Promise.all([getRoutineWithExercises(routineId), listExercises()]);
  if (!routine) notFound();

  const defaultRows = routine.exercises.map((ex) => ({
    tempId: String(ex.id),
    exerciseId: ex.exerciseId,
    targetSets: ex.targetSets,
    targetRepsMin: ex.targetRepsMin,
    targetRepsMax: ex.targetRepsMax,
    targetRpe: ex.targetRpe?.toString() ?? "",
    restSeconds: ex.restSeconds,
    groupId: ex.groupId ?? "",
    groupType: ex.groupType ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Routine</h1>
      <RoutineForm
        exercises={exercises}
        submit={updateRoutine.bind(null, routineId)}
        submitLabel="Save changes"
        defaultName={routine.name}
        defaultDescription={routine.description ?? ""}
        defaultRows={defaultRows}
      />
      <form action={deleteRoutine.bind(null, routineId)} className="max-w-xl border-t border-black/10 pt-4 dark:border-white/10">
        <Button type="submit" variant="danger">
          Delete routine
        </Button>
      </form>
    </div>
  );
}
