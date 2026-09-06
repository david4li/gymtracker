"use client";

import { useState, useTransition } from "react";
import { Stepper } from "./Stepper";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import type { WeightUnit } from "@/lib/db/schema";

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export function SetRow({
  unit,
  initialWeight,
  initialReps,
  onComplete,
}: {
  unit: WeightUnit;
  initialWeight: number;
  initialReps: number;
  onComplete: (input: { weight: number; reps: number; rpe?: number; isWarmup: boolean }) => Promise<void>;
}) {
  const [weight, setWeight] = useState(initialWeight);
  const [reps, setReps] = useState(initialReps);
  const [rpe, setRpe] = useState<number | undefined>(undefined);
  const [isWarmup, setIsWarmup] = useState(false);
  const [pending, startTransition] = useTransition();

  const weightStep = unit === "kg" ? 2.5 : 5;

  function submit() {
    startTransition(async () => {
      await onComplete({ weight, reps, rpe, isWarmup });
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-around gap-2">
        <Stepper label={`Weight (${unit})`} value={weight} onChange={setWeight} step={weightStep} decimals={1} />
        <Stepper label="Reps" value={reps} onChange={setReps} step={1} decimals={0} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-500">RPE (optional)</span>
        <div className="flex flex-wrap gap-1.5">
          {RPE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setRpe(rpe === opt ? undefined : opt)}
              className={`h-8 min-w-8 rounded-full px-2 text-xs font-semibold ${
                rpe === opt ? "bg-orange-600 text-white" : "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isWarmup} onChange={(e) => setIsWarmup(e.target.checked)} className="h-4 w-4 accent-orange-600" />
        Warm-up set
      </label>

      <Button size="lg" onClick={submit} disabled={pending} className="w-full">
        <CheckIcon width={20} height={20} />
        {pending ? "Logging..." : "Complete set"}
      </Button>
    </div>
  );
}
