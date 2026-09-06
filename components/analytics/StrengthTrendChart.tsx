"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export type StrengthTrendPoint = {
  date: string;
  epley1RM: number;
  brzycki1RM: number;
  bestWeight: number;
  bestReps: number;
};

export function StrengthTrendChart({
  data,
  formula,
  compact = false,
}: {
  data: StrengthTrendPoint[];
  formula: "epley" | "brzycki";
  compact?: boolean;
}) {
  const key = formula === "epley" ? "epley1RM" : "brzycki1RM";

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No logged sets yet for this exercise.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={compact ? 160 : 280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: compact ? -20 : 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-black/10 dark:stroke-white/10" />
        <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} fontSize={11} tickLine={false} />
        <YAxis fontSize={11} tickLine={false} width={compact ? 32 : 40} />
        <Tooltip
          formatter={(value) => [`${Math.round(Number(value))}`, "Est. 1RM"]}
          labelFormatter={(label) => `${label}`}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Line type="monotone" dataKey={key} stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
