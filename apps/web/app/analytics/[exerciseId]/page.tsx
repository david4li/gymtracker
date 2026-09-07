import { notFound } from "next/navigation";
import { getExerciseById, getExerciseSetHistory, listExercises, getStrengthTrend, getPlateauStatus, getSettings } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StrengthTrendSection } from "@/components/analytics/StrengthTrendSection";
import { ExercisePicker } from "@/components/analytics/ExercisePicker";
import { formatWeight } from "@gymtracker/shared/calculations/units";

export default async function ExerciseAnalyticsPage({ params }: PageProps<"/analytics/[exerciseId]">) {
  const { exerciseId: exerciseIdParam } = await params;
  const exerciseId = Number(exerciseIdParam);
  const exercise = await getExerciseById(exerciseId);
  if (!exercise) notFound();

  const [trend, plateau, history, settings, allExercises] = await Promise.all([
    getStrengthTrend(exerciseId),
    getPlateauStatus(exerciseId),
    getExerciseSetHistory(exerciseId, 10),
    getSettings(),
    listExercises(),
  ]);

  const prSets = history.filter((s) => s.isPr);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{exercise.name}</h1>
        <ExercisePicker exercises={allExercises} currentId={exerciseId} />
      </div>

      {plateau.plateaued ? (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-sm text-amber-800 dark:text-amber-300">{plateau.suggestion}</p>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Estimated 1RM trend" />
        <StrengthTrendSection data={trend} />
      </Card>

      <Card>
        <CardHeader title="PR history" />
        {prSets.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">No PRs yet for this exercise.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {prSets.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{formatWeight(s.weight, settings.weightUnit)} x {s.reps}</span>
                <Badge tone="orange">PR</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
