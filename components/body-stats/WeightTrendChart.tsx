"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { displayBodyWeight } from "@/lib/calculations/units";
import type { WeightUnit } from "@/lib/db/schema";

export function WeightTrendChart({ data, unit }: { data: { date: Date; weightKg: number | null }[]; unit: WeightUnit }) {
  const points = data
    .filter((d) => d.weightKg !== null)
    .map((d) => ({ date: format(d.date, "MMM d"), weight: Math.round(displayBodyWeight(d.weightKg!, unit) * 10) / 10 }))
    .reverse();

  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No weight entries yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-black/10 dark:stroke-white/10" />
        <XAxis dataKey="date" fontSize={11} tickLine={false} />
        <YAxis fontSize={11} tickLine={false} width={40} domain={["dataMin - 2", "dataMax + 2"]} />
        <Tooltip formatter={(v) => [`${v} ${unit}`, "Weight"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Line type="monotone" dataKey="weight" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
