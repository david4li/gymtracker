import type { ReactNode } from "react";

// Deliberately does not render NavShell: there is nothing to navigate to while signed out.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">GymTracker</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Track lifts, routines, and progress.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}
