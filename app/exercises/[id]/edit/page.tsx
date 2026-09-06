import { notFound } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { updateExercise, deleteExercise } from "@/lib/actions/exercises";
import { Button } from "@/components/ui/Button";

export default async function EditExercisePage({ params }: PageProps<"/exercises/[id]/edit">) {
  const { id } = await params;
  const exerciseId = Number(id);
  const exercise = await getExerciseById(exerciseId);
  if (!exercise) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Exercise</h1>
      <ExerciseForm
        action={updateExercise.bind(null, exerciseId)}
        defaultValues={exercise}
        submitLabel="Save changes"
      />
      <form action={deleteExercise.bind(null, exerciseId)} className="max-w-xl border-t border-black/10 pt-4 dark:border-white/10">
        <p className="mb-2 text-sm text-zinc-500">Only possible if no sets have been logged with this exercise.</p>
        <Button type="submit" variant="danger">
          Delete exercise
        </Button>
      </form>
    </div>
  );
}
