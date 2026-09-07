"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/Input";
import { setSplitDay } from "@/lib/actions/programming";

export function SplitDayRow({
  dayOfWeek,
  label,
  routineId,
  routines,
}: {
  dayOfWeek: number;
  label: string;
  routineId: number | null;
  routines: { id: number; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(() => {
      setSplitDay({ dayOfWeek, routineId: value ? Number(value) : null });
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="w-24 text-sm font-medium">{label}</span>
      <Select className="max-w-[220px]" value={routineId ?? ""} onChange={(e) => onChange(e.target.value)} disabled={pending}>
        <option value="">Rest day</option>
        {routines.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
