import Link from "next/link";
import { listBodyStats, getSettings } from "@/lib/api";
import { displayBodyWeight, formatWeight } from "@gymtracker/shared/calculations/units";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WeightTrendChart } from "@/components/body-stats/WeightTrendChart";
import { PlusIcon } from "@/components/ui/icons";
import { format } from "date-fns";

export default async function BodyStatsPage() {
  const [stats, settings] = await Promise.all([listBodyStats(), getSettings()]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Body Stats</h1>
        <Link href="/body-stats/new">
          <Button>
            <PlusIcon width={18} height={18} /> Log entry
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader title="Weight trend" />
        <WeightTrendChart data={stats} unit={settings.weightUnit} />
      </Card>

      <Card>
        <CardHeader title="Entries" />
        {stats.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">No entries yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {stats.map((s) => (
              <li key={s.id}>
                <Link href={`/body-stats/${s.id}/edit`} className="flex items-center justify-between py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                  <span>{format(s.date, "MMM d, yyyy")}</span>
                  <span className="text-zinc-500">{s.weightKg ? formatWeight(displayBodyWeight(s.weightKg, settings.weightUnit), settings.weightUnit) : "-"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
