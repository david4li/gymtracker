"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import type { MuscleGroup } from "@gymtracker/shared";

const COLORS: Record<string, string> = {
  chest: "#ea580c",
  back: "#0891b2",
  shoulders: "#7c3aed",
  biceps: "#16a34a",
  triceps: "#ca8a04",
  forearms: "#64748b",
  quads: "#dc2626",
  hamstrings: "#2563eb",
  glutes: "#db2777",
  calves: "#0d9488",
  abs: "#9333ea",
  full_body: "#57534e",
  cardio: "#059669",
};

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function VolumeChart({ data, muscleGroups }: { data: Record<string, number | string>[]; muscleGroups: MuscleGroup[] }) {
  if (data.every((d) => muscleGroups.every((mg) => !d[mg]))) {
    return <p className="py-8 text-center text-sm text-zinc-500">No completed workouts in this range yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-black/10 dark:stroke-white/10" />
        <XAxis dataKey="weekLabel" fontSize={11} tickLine={false} />
        <YAxis fontSize={11} tickLine={false} width={44} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => titleCase(v)} />
        {muscleGroups.map((mg) => (
          <Bar key={mg} dataKey={mg} stackId="volume" fill={COLORS[mg] ?? "#999"} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
