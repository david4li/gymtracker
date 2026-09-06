"use client";

import { useMemo, useState } from "react";
import { Field, Select, Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PERIODIZATION_SCHEMES } from "@/lib/db/schema";
import type { PeriodizationScheme } from "@/lib/db/schema";
import { generatePeriodizationPlan } from "@/lib/calculations/periodization";

export function PeriodizationCalculator({ routines }: { routines: { id: number; name: string }[] }) {
  const [routineId, setRoutineId] = useState<number | undefined>(routines[0]?.id);
  const [scheme, setScheme] = useState<PeriodizationScheme>("linear");
  const [weeks, setWeeks] = useState(6);

  const plan = useMemo(() => generatePeriodizationPlan(scheme, weeks), [scheme, weeks]);
  const routineName = routines.find((r) => r.id === routineId)?.name;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Routine">
          <Select value={routineId} onChange={(e) => setRoutineId(Number(e.target.value))}>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Scheme">
          <Select value={scheme} onChange={(e) => setScheme(e.target.value as PeriodizationScheme)}>
            {PERIODIZATION_SCHEMES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Weeks">
          <Input type="number" min={4} max={12} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} />
        </Field>
      </div>

      <Card>
        <p className="mb-3 text-sm text-zinc-500">
          Applying to <span className="font-medium text-zinc-900 dark:text-zinc-50">{routineName ?? "your routine"}</span> - this plan applies uniformly across all exercises in the routine as a starting guideline.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500">
                <th className="py-1.5 pr-3">Week</th>
                <th className="py-1.5 pr-3">Phase</th>
                <th className="py-1.5 pr-3">Reps</th>
                <th className="py-1.5 pr-3">Target RPE</th>
                <th className="py-1.5">Note</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((w) => (
                <tr key={w.week} className="border-t border-black/5 dark:border-white/5">
                  <td className="py-1.5 pr-3 font-medium">{w.week}</td>
                  <td className="py-1.5 pr-3">{w.phase}</td>
                  <td className="py-1.5 pr-3">{w.repsMin}-{w.repsMax}</td>
                  <td className="py-1.5 pr-3">{w.targetRpe}</td>
                  <td className="py-1.5 text-zinc-500">{w.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
