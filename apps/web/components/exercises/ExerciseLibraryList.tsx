"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@gymtracker/shared";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type ExerciseRow = {
  id: number;
  name: string;
  primaryMuscleGroup: string;
  equipment: string;
  isCustom: boolean;
};

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ExerciseLibraryList({ exercises }: { exercises: ExerciseRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`/exercises?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => setParam("search", e.target.value)}
          placeholder="Search exercises..."
          className="h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-white/15 dark:bg-black/20 sm:max-w-xs"
        />
        <Select
          defaultValue={searchParams.get("muscleGroup") ?? "all"}
          onChange={(e) => setParam("muscleGroup", e.target.value)}
          className="sm:max-w-[180px]"
        >
          <option value="all">All muscle groups</option>
          {MUSCLE_GROUPS.map((mg) => (
            <option key={mg} value={mg}>
              {titleCase(mg)}
            </option>
          ))}
        </Select>
        <Select
          defaultValue={searchParams.get("equipment") ?? "all"}
          onChange={(e) => setParam("equipment", e.target.value)}
          className="sm:max-w-[180px]"
        >
          <option value="all">All equipment</option>
          {EQUIPMENT_TYPES.map((eq) => (
            <option key={eq} value={eq}>
              {titleCase(eq)}
            </option>
          ))}
        </Select>
      </div>

      {exercises.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No exercises match those filters.</p>
      ) : (
        <ul className="divide-y divide-black/5 rounded-2xl border border-black/10 dark:divide-white/5 dark:border-white/10">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <Link href={`/exercises/${ex.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
                <div>
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-zinc-500">
                    {titleCase(ex.primaryMuscleGroup)} / {titleCase(ex.equipment)}
                  </p>
                </div>
                {ex.isCustom ? <Badge tone="orange">Custom</Badge> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
