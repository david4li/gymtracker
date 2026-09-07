function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Hand-built CSS-grid heatmap (no charting-library dependency) — cell opacity encodes relative volume. */
export function MuscleBalanceHeatmap({ data }: { data: { muscleGroup: string; volume: number; relative: number }[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No completed workouts in this range yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {data.map((d) => (
        <div
          key={d.muscleGroup}
          className="flex flex-col justify-between rounded-xl p-3"
          style={{ backgroundColor: `rgba(234, 88, 12, ${0.12 + d.relative * 0.6})` }}
        >
          <span className="text-sm font-semibold">{titleCase(d.muscleGroup)}</span>
          <span className="text-xs text-zinc-600 dark:text-zinc-300">{Math.round(d.volume).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
