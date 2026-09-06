import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseById, getExerciseSetHistory } from "@/lib/queries/exercises";
import { getStrengthTrend } from "@/lib/queries/analytics";
import { getSettings } from "@/lib/queries/settings";
import { formatWeight } from "@/lib/calculations/units";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StrengthTrendChart } from "@/components/analytics/StrengthTrendChart";
import { format } from "date-fns";

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ExerciseDetailPage({ params }: PageProps<"/exercises/[id]">) {
  const { id } = await params;
  const exerciseId = Number(id);
  const exercise = await getExerciseById(exerciseId);
  if (!exercise) notFound();

  const [history, trend, settings] = await Promise.all([
    getExerciseSetHistory(exerciseId, 20),
    getStrengthTrend(exerciseId),
    getSettings(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{exercise.name}</h1>
          <div className="mt-1 flex gap-2">
            <Badge>{titleCase(exercise.primaryMuscleGroup)}</Badge>
            <Badge>{titleCase(exercise.equipment)}</Badge>
            {exercise.isCustom ? <Badge tone="orange">Custom</Badge> : null}
          </div>
        </div>
        <Link href={`/exercises/${exercise.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
      </div>

      {exercise.notes ? (
        <Card>
          <CardHeader title="Notes" />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{exercise.notes}</p>
        </Card>
      ) : null}

      {exercise.videoUrl ? (
        <Card>
          <CardHeader title="Demo video" />
          <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline">
            {exercise.videoUrl}
          </a>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Strength trend"
          action={
            <Link href={`/analytics/${exercise.id}`} className="text-sm font-medium text-orange-600 hover:underline">
              Full analytics
            </Link>
          }
        />
        <StrengthTrendChart data={trend} formula="epley" compact />
      </Card>

      <Card>
        <CardHeader title="Recent sets" />
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">No sets logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="py-1.5 pr-3">Date</th>
                  <th className="py-1.5 pr-3">Weight</th>
                  <th className="py-1.5 pr-3">Reps</th>
                  <th className="py-1.5 pr-3">RPE</th>
                  <th className="py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id} className="border-t border-black/5 dark:border-white/5">
                    <td className="py-1.5 pr-3">{format(s.workoutDate, "MMM d")}</td>
                    <td className="py-1.5 pr-3">{formatWeight(s.weight, settings.weightUnit)}</td>
                    <td className="py-1.5 pr-3">{s.reps}</td>
                    <td className="py-1.5 pr-3">{s.rpe ?? "-"}</td>
                    <td className="py-1.5">
                      {s.isPr ? <Badge tone="orange">PR</Badge> : null}
                      {s.isWarmup ? <Badge>Warmup</Badge> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
