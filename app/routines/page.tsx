import Link from "next/link";
import { listRoutines } from "@/lib/queries/routines";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlusIcon, PlayIcon } from "@/components/ui/icons";
import { startWorkout } from "@/lib/actions/workouts";

export default async function RoutinesPage() {
  const routines = await listRoutines();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Routines</h1>
        <Link href="/routines/new">
          <Button>
            <PlusIcon width={18} height={18} /> New routine
          </Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No routines yet. Create one to speed up logging.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {routines.map((r) => (
            <Card key={r.id} className="flex flex-col gap-3">
              <Link href={`/routines/${r.id}`}>
                <p className="font-semibold">{r.name}</p>
                {r.description ? <p className="text-sm text-zinc-500">{r.description}</p> : null}
                <p className="mt-1 text-xs text-zinc-400">{r.exerciseCount} exercises</p>
              </Link>
              <form action={startWorkout.bind(null, r.id)}>
                <Button type="submit" variant="secondary" className="w-full">
                  <PlayIcon width={16} height={16} /> Start workout
                </Button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
