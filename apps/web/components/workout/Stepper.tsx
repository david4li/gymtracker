"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { NumpadOverlay } from "./NumpadOverlay";

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 2000,
  label,
  decimals = 0,
}: {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
  decimals?: number;
}) {
  const [numpadOpen, setNumpadOpen] = useState(false);

  function round(n: number) {
    const factor = 10 ** decimals;
    return Math.round(n * factor) / factor;
  }

  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(clamp(round(value - step)))}
          aria-label={`Decrease ${label}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 active:bg-black/10 dark:bg-white/10 dark:active:bg-white/15"
        >
          <MinusIcon width={18} height={18} />
        </button>
        <button
          type="button"
          onClick={() => setNumpadOpen(true)}
          className="min-w-[64px] rounded-lg px-2 py-1.5 text-center text-xl font-bold tabular-nums hover:bg-black/5 dark:hover:bg-white/10"
        >
          {value}
        </button>
        <button
          type="button"
          onClick={() => onChange(clamp(round(value + step)))}
          aria-label={`Increase ${label}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 active:bg-black/10 dark:bg-white/10 dark:active:bg-white/15"
        >
          <PlusIcon width={18} height={18} />
        </button>
      </div>
      {numpadOpen ? (
        <NumpadOverlay
          label={label}
          initialValue={value}
          onClose={() => setNumpadOpen(false)}
          onSubmit={(n) => {
            onChange(clamp(round(n)));
            setNumpadOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
