import { create } from "zustand";

type StepperDefaults = { weight: number; reps: number };

type WorkoutStore = {
  // Rest timer — purely client-side/ephemeral; never persisted, always safe to lose on refresh.
  restSecondsLeft: number;
  restTotalSeconds: number;
  restRunning: boolean;
  startRest: (seconds: number) => void;
  tickRest: () => void;
  stopRest: () => void;
  addRestSeconds: (delta: number) => void;

  // Exercise switcher bottom sheet.
  switcherOpen: boolean;
  openSwitcher: () => void;
  closeSwitcher: () => void;

  // Which exercise the logging UI is currently focused on.
  activeExerciseId: number | null;
  setActiveExercise: (id: number | null) => void;

  // Per-exercise "last tapped" stepper values within this session, so tapping
  // "repeat last set" or switching back to an exercise pre-fills sensible numbers.
  lastTappedDefaults: Record<number, StepperDefaults>;
  setLastTappedDefaults: (exerciseId: number, defaults: StepperDefaults) => void;
};

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  restSecondsLeft: 0,
  restTotalSeconds: 0,
  restRunning: false,
  startRest: (seconds) => set({ restSecondsLeft: seconds, restTotalSeconds: seconds, restRunning: true }),
  tickRest: () =>
    set((s) => {
      if (!s.restRunning) return s;
      const next = s.restSecondsLeft - 1;
      if (next <= 0) return { restSecondsLeft: 0, restRunning: false };
      return { restSecondsLeft: next };
    }),
  stopRest: () => set({ restRunning: false, restSecondsLeft: 0 }),
  addRestSeconds: (delta) => set((s) => ({ restSecondsLeft: Math.max(0, s.restSecondsLeft + delta) })),

  switcherOpen: false,
  openSwitcher: () => set({ switcherOpen: true }),
  closeSwitcher: () => set({ switcherOpen: false }),

  activeExerciseId: null,
  setActiveExercise: (id) => set({ activeExerciseId: id }),

  lastTappedDefaults: {},
  setLastTappedDefaults: (exerciseId, defaults) =>
    set((s) => ({ lastTappedDefaults: { ...s.lastTappedDefaults, [exerciseId]: defaults } })),
}));
