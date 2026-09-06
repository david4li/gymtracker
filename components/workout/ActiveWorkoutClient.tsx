"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { logSet, deleteSet, finishWorkout, cancelActiveWorkout, getLastTimeForExercise } from "@/lib/actions/workouts";
import { SetRow } from "./SetRow";
import { LastTimeCard } from "./LastTimeCard";
import { ExerciseSwitcherSheet } from "./ExerciseSwitcherSheet";
import { RestTimer } from "./RestTimer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatWeight } from "@/lib/calculations/units";
import type { WeightUnit } from "@/lib/db/schema";
import { XIcon } from "@/components/ui/icons";

type LoggedSet = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
};

type RoutineTarget = {
  exerciseId: number;
  exerciseName: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
};

type ExerciseOption = { id: number; name: string; primaryMuscleGroup: string };

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function useElapsed(startedAt: Date) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ActiveWorkoutClient({
  workoutId,
  startedAt,
  routineName,
  initialSets,
  allExercises,
  routineTargets,
  defaultRestSeconds,
  unit,
}: {
  workoutId: number;
  startedAt: Date;
  routineName: string | null;
  initialSets: LoggedSet[];
  allExercises: ExerciseOption[];
  routineTargets: RoutineTarget[];
  defaultRestSeconds: number;
  unit: WeightUnit;
}) {
  const elapsed = useElapsed(startedAt);
  const [sets, setSets] = useState<LoggedSet[]>(initialSets);
  const [lastTime, setLastTime] = useState<{
    exerciseId: number;
    data: Awaited<ReturnType<typeof getLastTimeForExercise>>;
  } | null>(null);
  const { activeExerciseId, setActiveExercise, switcherOpen, openSwitcher, closeSwitcher, startRest, lastTappedDefaults, setLastTappedDefaults } =
    useWorkoutStore();

  const exerciseOrder = useMemo(() => {
    const seen = new Set<number>();
    const order: number[] = [];
    for (const s of sets) {
      if (!seen.has(s.exerciseId)) {
        seen.add(s.exerciseId);
        order.push(s.exerciseId);
      }
    }
    for (const t of routineTargets) {
      if (!seen.has(t.exerciseId)) {
        seen.add(t.exerciseId);
        order.push(t.exerciseId);
      }
    }
    return order;
  }, [sets, routineTargets]);

  useEffect(() => {
    if (activeExerciseId === null && exerciseOrder.length > 0) {
      setActiveExercise(exerciseOrder[0]);
    }
  }, [activeExerciseId, exerciseOrder, setActiveExercise]);

  useEffect(() => {
    if (activeExerciseId === null) return;
    let cancelled = false;
    getLastTimeForExercise(activeExerciseId, workoutId).then((res) => {
      if (!cancelled) setLastTime({ exerciseId: activeExerciseId, data: res });
    });
    return () => {
      cancelled = true;
    };
  }, [activeExerciseId, workoutId]);

  const activeExercise = allExercises.find((e) => e.id === activeExerciseId) ?? null;
  const lastTimeForActive = lastTime?.exerciseId === activeExerciseId ? lastTime.data : null;
  const activeTarget = routineTargets.find((t) => t.exerciseId === activeExerciseId) ?? null;
  const setsForActive = sets.filter((s) => s.exerciseId === activeExerciseId);

  const nextDefaults = useMemo(() => {
    if (activeExerciseId === null) return { weight: 0, reps: 8 };
    const tapped = lastTappedDefaults[activeExerciseId];
    if (tapped) return tapped;
    const lastLogged = setsForActive[setsForActive.length - 1];
    if (lastLogged) return { weight: lastLogged.weight, reps: lastLogged.reps };
    if (lastTimeForActive && lastTimeForActive.length > 0) {
      const working = lastTimeForActive.find((s) => !s.isWarmup) ?? lastTimeForActive[0];
      return { weight: working.weight, reps: working.reps };
    }
    if (activeTarget) return { weight: 0, reps: activeTarget.targetRepsMin };
    return { weight: 0, reps: 8 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExerciseId, setsForActive.length, lastTimeForActive, activeTarget]);

  async function handleComplete(input: { weight: number; reps: number; rpe?: number; isWarmup: boolean }) {
    if (activeExerciseId === null || !activeExercise) return;
    const setNumber = setsForActive.length + 1;
    const row = await logSet({
      workoutId,
      exerciseId: activeExerciseId,
      setNumber,
      weight: input.weight,
      reps: input.reps,
      rpe: input.rpe,
      isWarmup: input.isWarmup,
    });
    setSets((prev) => [
      ...prev,
      {
        id: row.id,
        exerciseId: activeExerciseId,
        exerciseName: activeExercise.name,
        setNumber: row.setNumber,
        weight: row.weight,
        reps: row.reps,
        rpe: row.rpe,
        isWarmup: row.isWarmup,
        isPr: row.isPr,
      },
    ]);
    setLastTappedDefaults(activeExerciseId, { weight: input.weight, reps: input.reps });
    if (!input.isWarmup) {
      startRest(activeTarget?.restSeconds ?? defaultRestSeconds);
    }
  }

  async function handleDeleteSet(setId: number) {
    await deleteSet(setId);
    setSets((prev) => prev.filter((s) => s.id !== setId));
  }

  const otherExercises = exerciseOrder.filter((id) => id !== activeExerciseId);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{routineName ?? "Freestyle Workout"}</h1>
          <p className="text-sm tabular-nums text-zinc-500">{elapsed} elapsed</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("Discard this workout? This can't be undone.")) cancelActiveWorkout(workoutId);
            }}
          >
            Discard
          </Button>
          <Button onClick={() => finishWorkout(workoutId)}>Finish</Button>
        </div>
      </div>

      {activeExercise ? (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{activeExercise.name}</h2>
              <p className="text-xs text-zinc-500">
                {titleCase(activeExercise.primaryMuscleGroup)}
                {activeTarget ? ` - Target: ${activeTarget.targetSets} x ${activeTarget.targetRepsMin}-${activeTarget.targetRepsMax}` : ""}
              </p>
            </div>
            <Button variant="secondary" onClick={openSwitcher}>
              Switch
            </Button>
          </div>

          <LastTimeCard sets={lastTimeForActive} unit={unit} />

          {setsForActive.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {setsForActive.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/5">
                  <span>
                    Set {s.setNumber}: {formatWeight(s.weight, unit)} x {s.reps}
                    {s.rpe ? ` @${s.rpe}` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    {s.isPr ? <Badge tone="orange">PR</Badge> : null}
                    {s.isWarmup ? <Badge>Warmup</Badge> : null}
                    <button onClick={() => handleDeleteSet(s.id)} aria-label="Delete set" className="text-zinc-400 hover:text-red-600">
                      <XIcon width={14} height={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <SetRow key={`${activeExerciseId}-${setsForActive.length}`} unit={unit} initialWeight={nextDefaults.weight} initialReps={nextDefaults.reps} onComplete={handleComplete} />
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-zinc-500">Choose an exercise to start logging.</p>
          <Button onClick={openSwitcher}>Choose exercise</Button>
        </Card>
      )}

      {otherExercises.length > 0 ? (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase text-zinc-400">Also logged this workout</p>
          <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {otherExercises.map((id) => {
              const name = sets.find((s) => s.exerciseId === id)?.exerciseName ?? allExercises.find((e) => e.id === id)?.name;
              const count = sets.filter((s) => s.exerciseId === id).length;
              return (
                <li key={id}>
                  <button onClick={() => setActiveExercise(id)} className="flex w-full items-center justify-between py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5">
                    <span>{name}</span>
                    <span className="text-xs text-zinc-400">{count} set{count === 1 ? "" : "s"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <RestTimer />
      <ExerciseSwitcherSheet
        open={switcherOpen}
        onClose={closeSwitcher}
        exercises={allExercises}
        usedExerciseIds={exerciseOrder}
        onSelect={(id) => {
          setActiveExercise(id);
          closeSwitcher();
        }}
      />
    </div>
  );
}
