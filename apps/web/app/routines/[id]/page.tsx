import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoutineWithExercises } from "@/lib/api";
import { startWorkout } from "@/lib/actions/workouts";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlayIcon } from "@/components/ui/icons";

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function RoutineDetailPage({ params }: PageProps<"/routines/[id]">) {
  const { id } = await params;
  const routine = await getRoutineWithExercises(Number(id));
  if (!routine) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{routine.name}</h1>
          {routine.description ? <p className="text-sm text-zinc-500">{routine.description}</p> : null}
        </div>
        <div className="flex gap-2">
          <Link href={`/routines/${routine.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <form action={startWorkout.bind(null, routine.id)}>
            <Button type="submit">
              <PlayIcon width={18} height={18} /> Start
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader title="Exercises" />
        <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
          {routine.exercises.map((ex) => (
            <li key={ex.id} className="flex items-center justify-between gap-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{ex.exerciseName}</p>
                <p className="text-xs text-zinc-500">
                  {titleCase(ex.primaryMuscleGroup)} - {ex.targetSets} x {ex.targetRepsMin}-{ex.targetRepsMax}
                  {ex.targetRpe ? ` @RPE ${ex.targetRpe}` : ""} - {ex.restSeconds}s rest
                </p>
              </div>
              {ex.groupType ? <Badge tone="orange">{ex.groupType} {ex.groupId}</Badge> : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
