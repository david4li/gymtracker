import Link from "next/link";
import { getWorkoutHistory } from "@/lib/queries/workouts";
import { getSettings } from "@/lib/queries/settings";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";

export default async function WorkoutHistoryPage() {
  const [workouts, settings] = await Promise.all([getWorkoutHistory(), getSettings()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Workout History</h1>

      {workouts.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No finished workouts yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((w) => (
            <Link key={w.id} href={`/workouts/${w.id}`}>
              <Card className="flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5">
                <div>
                  <p className="font-medium">{w.routineName ?? "Freestyle Workout"}</p>
                  <p className="text-xs text-zinc-500">
                    {format(w.date, "EEE, MMM d, yyyy")}
                    {w.durationSeconds ? ` - ${Math.round(w.durationSeconds / 60)}m` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right text-xs text-zinc-500">
                  <span>
                    {w.setCount} sets / {w.exerciseCount} exercises
                    <br />
                    {Math.round(w.volume).toLocaleString()} {settings.weightUnit}
                  </span>
                  {w.prCount > 0 ? <Badge tone="orange">{w.prCount} PR{w.prCount === 1 ? "" : "s"}</Badge> : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
