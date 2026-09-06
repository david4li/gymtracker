import { redirect } from "next/navigation";
import { getActiveWorkout } from "@/lib/queries/workouts";
import { listRoutinesForSelect } from "@/lib/queries/routines";
import { startWorkout } from "@/lib/actions/workouts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlayIcon } from "@/components/ui/icons";

export default async function ActiveWorkoutPage() {
  const active = await getActiveWorkout();
  if (active) redirect(`/workouts/${active.id}`);

  const routines = await listRoutinesForSelect();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Start a Workout</h1>
      <Card className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500">Start from a routine to get target sets/reps as you log, or start blank and log freely.</p>
        <div className="flex flex-col gap-2">
          {routines.map((r) => (
            <form key={r.id} action={startWorkout.bind(null, r.id)}>
              <Button type="submit" className="w-full justify-start" variant="secondary" size="lg">
                <PlayIcon width={18} height={18} /> {r.name}
              </Button>
            </form>
          ))}
          <form action={startWorkout.bind(null, undefined)}>
            <Button type="submit" className="w-full" size="lg">
              Start blank workout
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
