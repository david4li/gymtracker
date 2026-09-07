import Link from "next/link";
import { getWeeklyVolumeByMuscleGroup, getMuscleBalance, getPRList, getSettings } from "@/lib/api";
import { MUSCLE_GROUPS } from "@gymtracker/shared";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VolumeChart } from "@/components/analytics/VolumeChart";
import { MuscleBalanceHeatmap } from "@/components/analytics/MuscleBalanceHeatmap";
import { formatWeight } from "@gymtracker/shared/calculations/units";
import { format } from "date-fns";

export default async function AnalyticsPage() {
  const [weeklyVolume, balance, prs, settings] = await Promise.all([
    getWeeklyVolumeByMuscleGroup(8),
    getMuscleBalance(4),
    getPRList(15),
    getSettings(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="text-sm text-zinc-500">
        Looking for one exercise&apos;s 1RM trend? Open it from the <Link href="/exercises" className="text-orange-600 hover:underline">exercise library</Link> or pick it below.
      </p>

      <Card>
        <CardHeader title="Weekly volume by muscle group" />
        <VolumeChart data={weeklyVolume} muscleGroups={[...MUSCLE_GROUPS]} />
      </Card>

      <Card>
        <CardHeader title="Muscle balance (last 4 weeks)" />
        <MuscleBalanceHeatmap data={balance} />
      </Card>

      <Card>
        <CardHeader title="Personal records" />
        {prs.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">No PRs logged yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {prs.map((pr) => (
              <li key={pr.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <Link href={`/analytics/${pr.exerciseId}`} className="font-medium hover:underline">
                    {pr.exerciseName}
                  </Link>
                  <p className="text-xs text-zinc-500">{format(pr.date, "MMM d, yyyy")}</p>
                </div>
                <span className="flex items-center gap-2 text-zinc-500">
                  {formatWeight(pr.weight, settings.weightUnit)} x {pr.reps}
                  <Badge tone="orange">PR</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
