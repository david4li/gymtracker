import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatWeight } from "@/lib/calculations/units";
import { setVolume } from "@/lib/calculations/volume";
import type { WeightUnit } from "@/lib/db/schema";
import { format } from "date-fns";

type SetRow = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
};

export function WorkoutSummary({
  routineName,
  date,
  durationSeconds,
  notes,
  sets,
  unit,
}: {
  routineName: string | null;
  date: Date;
  durationSeconds: number | null;
  notes: string | null;
  sets: SetRow[];
  unit: WeightUnit;
}) {
  const byExercise = new Map<number, { name: string; sets: SetRow[] }>();
  for (const s of sets) {
    if (!byExercise.has(s.exerciseId)) byExercise.set(s.exerciseId, { name: s.exerciseName, sets: [] });
    byExercise.get(s.exerciseId)!.sets.push(s);
  }
  const totalVolume = sets.filter((s) => !s.isWarmup).reduce((sum, s) => sum + setVolume(s.weight, s.reps), 0);
  const prCount = sets.filter((s) => s.isPr).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{routineName ?? "Freestyle Workout"}</h1>
        <p className="text-sm text-zinc-500">{format(date, "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="py-3 text-center">
          <p className="text-lg font-bold">{durationSeconds ? `${Math.round(durationSeconds / 60)}m` : "-"}</p>
          <p className="text-xs text-zinc-500">Duration</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-lg font-bold">{Math.round(totalVolume).toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Volume ({unit})</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-lg font-bold">{prCount}</p>
          <p className="text-xs text-zinc-500">PRs</p>
        </Card>
      </div>

      {notes ? (
        <Card>
          <CardHeader title="Notes" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{notes}</p>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Sets" />
        <div className="flex flex-col gap-4">
          {Array.from(byExercise.entries()).map(([exerciseId, group]) => (
            <div key={exerciseId}>
              <p className="mb-1 text-sm font-semibold">{group.name}</p>
              <ul className="flex flex-col gap-1">
                {group.sets.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-1.5 text-sm dark:bg-white/5">
                    <span>
                      Set {s.setNumber}: {formatWeight(s.weight, unit)} x {s.reps}
                      {s.rpe ? ` @${s.rpe}` : ""}
                    </span>
                    <span className="flex gap-1">
                      {s.isPr ? <Badge tone="orange">PR</Badge> : null}
                      {s.isWarmup ? <Badge>Warmup</Badge> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
