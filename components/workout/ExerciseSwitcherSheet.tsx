"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

type ExerciseOption = { id: number; name: string; primaryMuscleGroup: string };

export function ExerciseSwitcherSheet({
  open,
  onClose,
  exercises,
  usedExerciseIds,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  exercises: ExerciseOption[];
  usedExerciseIds: number[];
  onSelect: (exerciseId: number) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => exercises.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase())),
    [exercises, search],
  );
  const used = filtered.filter((ex) => usedExerciseIds.includes(ex.id));
  const rest = filtered.filter((ex) => !usedExerciseIds.includes(ex.id));

  return (
    <BottomSheet open={open} onClose={onClose} title="Switch exercise">
      <div className="flex flex-col gap-3">
        <Input autoFocus placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="max-h-[55vh] overflow-y-auto">
          {used.length > 0 ? (
            <>
              <p className="mb-1 mt-1 text-xs font-semibold uppercase text-zinc-400">In this workout</p>
              <ExerciseButtonList exercises={used} onSelect={onSelect} />
            </>
          ) : null}
          <p className="mb-1 mt-3 text-xs font-semibold uppercase text-zinc-400">All exercises</p>
          <ExerciseButtonList exercises={rest} onSelect={onSelect} />
        </div>
      </div>
    </BottomSheet>
  );
}

function ExerciseButtonList({ exercises, onSelect }: { exercises: ExerciseOption[]; onSelect: (id: number) => void }) {
  if (exercises.length === 0) return <p className="py-2 text-sm text-zinc-400">No matches.</p>;
  return (
    <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
      {exercises.map((ex) => (
        <li key={ex.id}>
          <button
            type="button"
            onClick={() => onSelect(ex.id)}
            className="flex w-full items-center justify-between py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="font-medium">{ex.name}</span>
            <span className="text-xs text-zinc-400">{ex.primaryMuscleGroup.replace("_", " ")}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
