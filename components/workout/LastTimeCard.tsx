import { formatWeight } from "@/lib/calculations/units";
import type { WeightUnit } from "@/lib/db/schema";

type LastTimeSet = { setNumber: number; weight: number; reps: number; rpe: number | null; isWarmup: boolean };

export function LastTimeCard({ sets, unit }: { sets: LastTimeSet[] | null; unit: WeightUnit }) {
  if (!sets || sets.length === 0) {
    return <p className="text-xs text-zinc-400">No previous data for this exercise yet.</p>;
  }
  return (
    <div className="rounded-lg bg-black/5 px-3 py-2 text-xs text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
      <span className="font-semibold">Last time: </span>
      {sets
        .filter((s) => !s.isWarmup)
        .map((s) => `${formatWeight(s.weight, unit)} x ${s.reps}`)
        .join(", ")}
    </div>
  );
}
