// Wire types: exactly what the API returns and the frontend consumes.
//
// Timestamps cross the wire as ISO 8601 strings. The frontend revives the instant-typed ones
// into Date objects at the fetch boundary (see apps/web/lib/api/revive.ts), because components
// call date-fns format() and .getTime() on them. Calendar days stay strings end to end.

import type { Equipment, GroupType, MuscleGroup, WeightUnit } from "./enums";

/** An instant, ISO 8601 with a zone. Revived into a Date by the frontend. */
export type IsoDateTime = string;
/** A calendar day, YYYY-MM-DD. Stays a string. */
export type IsoDate = string;

// ---------- Exercises ----------

export type ExerciseDto = {
  id: number;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
  notes: string | null;
  videoUrl: string | null;
  /** Derived from ownership: a global catalog row is not custom. */
  isCustom: boolean;
  createdAt: IsoDateTime;
};

export type ExerciseSetHistoryDto = {
  id: number;
  workoutId: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
  completedAt: IsoDateTime;
  workoutDate: IsoDateTime;
};

export type LastTimeSetDto = {
  id: number;
  workoutId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  workoutDate: IsoDateTime;
};

// ---------- Routines ----------

export type RoutineListItemDto = {
  id: number;
  name: string;
  description: string | null;
  exerciseCount: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type RoutineExerciseDto = {
  id: number;
  sortOrder: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRpe: number | null;
  restSeconds: number;
  groupId: string | null;
  groupType: GroupType | null;
  exerciseId: number;
  exerciseName: string;
  primaryMuscleGroup: MuscleGroup;
};

export type RoutineDetailDto = RoutineListItemDto & {
  exercises: RoutineExerciseDto[];
};

// ---------- Workouts ----------

export type WorkoutDto = {
  id: number;
  date: IsoDateTime;
  routineId: number | null;
  notes: string | null;
  startedAt: IsoDateTime;
  /** null means this workout is still in progress. */
  finishedAt: IsoDateTime | null;
  durationSeconds: number | null;
};

export type WorkoutSetDto = {
  id: number;
  workoutId: number;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
  groupId: string | null;
  completedAt: IsoDateTime;
};

export type WorkoutDetailDto = WorkoutDto & {
  routineName: string | null;
  sets: WorkoutSetDto[];
};

export type WorkoutSummaryDto = WorkoutDto & {
  routineName: string | null;
  volume: number;
  exerciseCount: number;
  setCount: number;
  prCount: number;
};

// ---------- Body stats ----------

export type BodyStatDto = {
  id: number;
  date: IsoDate;
  /** Always kilograms. The frontend converts for display. */
  weightKg: number | null;
  measurements: Record<string, number> | null;
  photoUrl: string | null;
  notes: string | null;
};

// ---------- Analytics ----------

export type WeeklyVolumeDto = {
  weekStart: IsoDate;
  weekLabel: string;
} & Partial<Record<MuscleGroup, number>>;

export type MuscleBalanceDto = {
  muscleGroup: MuscleGroup;
  volume: number;
  /** Share of total volume, 0 to 1. */
  relative: number;
};

export type PrDto = {
  id: number;
  weight: number;
  reps: number;
  workoutId: number;
  exerciseId: number;
  exerciseName: string;
  date: IsoDateTime;
};

export type StrengthTrendPointDto = {
  /** Session day, YYYY-MM-DD. Already a string today; unchanged. */
  date: IsoDate;
  // Field names match what StrengthTrendChart and StrengthTrendSection already read.
  epley1RM: number;
  brzycki1RM: number;
  bestWeight: number;
  bestReps: number;
};

export type PlateauDto = {
  plateaued: boolean;
  suggestion: string | null;
};

export type ExerciseAnalyticsDto = {
  trend: StrengthTrendPointDto[];
  plateau: PlateauDto;
};

// ---------- Programming ----------

export type SplitDayDto = {
  dayOfWeek: number;
  label: string;
  routineId: number | null;
  routineName: string | null;
};

// ---------- Settings ----------

export type SettingsDto = {
  weightUnit: WeightUnit;
  defaultRestSeconds: number;
  timezone: string;
};

// ---------- Errors ----------

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
