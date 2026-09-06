"use client";

import { useState } from "react";
import { StrengthTrendChart, type StrengthTrendPoint } from "./StrengthTrendChart";

export function StrengthTrendSection({ data }: { data: StrengthTrendPoint[] }) {
  const [formula, setFormula] = useState<"epley" | "brzycki">("epley");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 self-end">
        {(["epley", "brzycki"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFormula(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              formula === f ? "bg-orange-600 text-white" : "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <StrengthTrendChart data={data} formula={formula} />
    </div>
  );
}
