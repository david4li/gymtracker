import { getWeeklySplit, listRoutinesForSelect } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { SplitDayRow } from "@/components/programming/SplitDayRow";

export default async function SplitBuilderPage() {
  const [split, routines] = await Promise.all([getWeeklySplit(), listRoutinesForSelect()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Weekly Split Builder</h1>
      <p className="text-sm text-zinc-500">Assign a routine to each day of the week, or leave it as a rest day.</p>
      <Card>
        <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
          {split.map((day) => (
            <SplitDayRow key={day.dayOfWeek} dayOfWeek={day.dayOfWeek} label={day.label} routineId={day.routineId} routines={routines} />
          ))}
        </div>
      </Card>
    </div>
  );
}
