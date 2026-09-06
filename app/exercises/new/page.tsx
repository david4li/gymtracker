import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { createExercise } from "@/lib/actions/exercises";

export default function NewExercisePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">New Exercise</h1>
      <ExerciseForm action={createExercise} submitLabel="Create exercise" />
    </div>
  );
}
