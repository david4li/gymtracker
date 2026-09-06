import type { ReactNode } from "react";

type Tone = "neutral" | "orange" | "green" | "red";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
