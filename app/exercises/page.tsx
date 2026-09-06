import Link from "next/link";
import { listExercises } from "@/lib/queries/exercises";
import { ExerciseLibraryList } from "@/components/exercises/ExerciseLibraryList";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/icons";
import type { MuscleGroup, Equipment } from "@/lib/db/schema";

export default async function ExercisesPage({
  searchParams,
}: PageProps<"/exercises">) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const muscleGroup = typeof params.muscleGroup === "string" ? (params.muscleGroup as MuscleGroup | "all") : undefined;
  const equipment = typeof params.equipment === "string" ? (params.equipment as Equipment | "all") : undefined;

  const exercises = await listExercises({ search, muscleGroup, equipment });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-sm text-zinc-500">{exercises.length} exercises</p>
        </div>
        <Link href="/exercises/new">
          <Button>
            <PlusIcon width={18} height={18} /> New
          </Button>
        </Link>
      </div>
      <ExerciseLibraryList exercises={exercises} />
    </div>
  );
}
