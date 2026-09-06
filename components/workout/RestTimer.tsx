"use client";

import { useEffect } from "react";
import { useWorkoutStore } from "@/lib/store/workoutStore";
import { Button } from "@/components/ui/Button";

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RestTimer() {
  const { restSecondsLeft, restTotalSeconds, restRunning, tickRest, stopRest, addRestSeconds } = useWorkoutStore();

  useEffect(() => {
    if (!restRunning) return;
    const interval = setInterval(() => tickRest(), 1000);
    return () => clearInterval(interval);
  }, [restRunning, tickRest]);

  useEffect(() => {
    if (restRunning && restSecondsLeft === 0 && restTotalSeconds > 0) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(200);
      }
    }
  }, [restRunning, restSecondsLeft, restTotalSeconds]);

  if (!restRunning) return null;

  const progress = restTotalSeconds > 0 ? (restTotalSeconds - restSecondsLeft) / restTotalSeconds : 0;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto flex w-full max-w-sm items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2 shadow-lg dark:border-white/10 dark:bg-zinc-900 md:bottom-4">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10 dark:text-white/10" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#ea580c"
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 16}
            strokeDashoffset={2 * Math.PI * 16 * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="flex-1 text-lg font-bold tabular-nums">{formatClock(restSecondsLeft)}</span>
      <button onClick={() => addRestSeconds(-15)} className="text-xs font-medium text-zinc-500">
        -15s
      </button>
      <button onClick={() => addRestSeconds(15)} className="text-xs font-medium text-zinc-500">
        +15s
      </button>
      <Button size="md" variant="ghost" onClick={stopRest}>
        Skip
      </Button>
    </div>
  );
}
