"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlusIcon, XIcon } from "@/components/ui/icons";
import { GROUP_TYPES } from "@gymtracker/shared";
import type { RoutineInput } from "@gymtracker/shared";

type ExerciseOption = { id: number; name: string };

/**
 * redirect() signals navigation by throwing, and that throw travels through this component's
 * error handling. Identified by digest rather than by importing Next's internal helper, whose
 * path is not a public API.
 */
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

type Row = {
  tempId: string;
  exerciseId: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRpe: string;
  restSeconds: number;
  groupId: string;
  groupType: string;
};

function emptyRow(exerciseId: number): Row {
  return {
    tempId: crypto.randomUUID(),
    exerciseId,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 12,
    targetRpe: "",
    restSeconds: 90,
    groupId: "",
    groupType: "",
  };
}

export function RoutineForm({
  exercises,
  submit,
  submitLabel,
  defaultName = "",
  defaultDescription = "",
  defaultRows,
}: {
  exercises: ExerciseOption[];
  submit: (input: RoutineInput) => Promise<void>;
  submitLabel: string;
  defaultName?: string;
  defaultDescription?: string;
  defaultRows?: Row[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [rows, setRows] = useState<Row[]>(defaultRows?.length ? defaultRows : exercises[0] ? [emptyRow(exercises[0].id)] : []);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    if (!exercises[0]) return;
    setRows((r) => [...r, emptyRow(exercises[0].id)]);
  }
  function removeRow(tempId: string) {
    setRows((r) => r.filter((row) => row.tempId !== tempId));
  }
  function move(tempId: string, dir: -1 | 1) {
    setRows((r) => {
      const idx = r.findIndex((row) => row.tempId === tempId);
      const target = idx + dir;
      if (target < 0 || target >= r.length) return r;
      const next = [...r];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  function patchRow(tempId: string, patch: Partial<Row>) {
    setRows((r) => r.map((row) => (row.tempId === tempId ? { ...row, ...patch } : row)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (rows.length === 0) {
      setError("Add at least one exercise.");
      return;
    }
    const input: RoutineInput = {
      name,
      description,
      exercises: rows.map((row, i) => ({
        exerciseId: row.exerciseId,
        sortOrder: i,
        targetSets: row.targetSets,
        targetRepsMin: row.targetRepsMin,
        targetRepsMax: row.targetRepsMax,
        targetRpe: row.targetRpe ? Number(row.targetRpe) : undefined,
        restSeconds: row.restSeconds,
        groupId: row.groupId || undefined,
        groupType: row.groupType ? (row.groupType as (typeof GROUP_TYPES)[number]) : undefined,
      })),
    };
    startTransition(async () => {
      try {
        await submit(input);
      } catch (err) {
        // redirect() signals navigation by throwing. Swallowing it would strand the user on
        // a saved routine's form; it must be re-thrown so React can act on it.
        if (isRedirectError(err)) throw err;
        // Show the server's own message when there is one, so a validation failure says
        // what was wrong instead of "something went wrong".
        setError(
          err instanceof Error && err.message
            ? err.message
            : "Something went wrong saving this routine.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Name" htmlFor="routine-name">
        <Input id="routine-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Description" htmlFor="routine-description">
        <Textarea id="routine-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Exercises</h2>
          <Button type="button" variant="secondary" size="md" onClick={addRow}>
            <PlusIcon width={16} height={16} /> Add exercise
          </Button>
        </div>

        {rows.map((row, i) => (
          <Card key={row.tempId} className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1 pt-2">
                <button type="button" onClick={() => move(row.tempId, -1)} disabled={i === 0} className="text-xs text-zinc-400 disabled:opacity-30">
                  Up
                </button>
                <button type="button" onClick={() => move(row.tempId, 1)} disabled={i === rows.length - 1} className="text-xs text-zinc-400 disabled:opacity-30">
                  Down
                </button>
              </div>
              <div className="flex-1">
                <Select value={row.exerciseId} onChange={(e) => patchRow(row.tempId, { exerciseId: Number(e.target.value) })}>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </Select>
              </div>
              <button type="button" onClick={() => removeRow(row.tempId)} className="mt-2 text-zinc-400 hover:text-red-600" aria-label="Remove exercise">
                <XIcon width={18} height={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Sets">
                <Input type="number" min={1} value={row.targetSets} onChange={(e) => patchRow(row.tempId, { targetSets: Number(e.target.value) })} />
              </Field>
              <Field label="Reps min">
                <Input type="number" min={1} value={row.targetRepsMin} onChange={(e) => patchRow(row.tempId, { targetRepsMin: Number(e.target.value) })} />
              </Field>
              <Field label="Reps max">
                <Input type="number" min={1} value={row.targetRepsMax} onChange={(e) => patchRow(row.tempId, { targetRepsMax: Number(e.target.value) })} />
              </Field>
              <Field label="Rest (s)">
                <Input type="number" min={0} step={15} value={row.restSeconds} onChange={(e) => patchRow(row.tempId, { restSeconds: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Field label="Target RPE" hint="Optional">
                <Input type="number" min={1} max={10} step={0.5} value={row.targetRpe} onChange={(e) => patchRow(row.tempId, { targetRpe: e.target.value })} />
              </Field>
              <Field label="Group type" hint="Superset/circuit/drop-set">
                <Select value={row.groupType} onChange={(e) => patchRow(row.tempId, { groupType: e.target.value })}>
                  <option value="">None</option>
                  {GROUP_TYPES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Group ID" hint="Same value links exercises together">
                <Input value={row.groupId} onChange={(e) => patchRow(row.tempId, { groupId: e.target.value })} placeholder="e.g. A" />
              </Field>
            </div>
          </Card>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
