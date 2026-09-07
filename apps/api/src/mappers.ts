// Postgres rows are snake_case; the wire contract is camelCase. Mapping happens here and
// nowhere else, so the frontend sees shapes identical to what the old Drizzle queries returned.

import type {
  BodyStatDto,
  ExerciseDto,
  ExerciseSetHistoryDto,
  LastTimeSetDto,
  RoutineExerciseDto,
  SettingsDto,
  SplitDayDto,
  WorkoutDto,
  WorkoutSetDto,
} from "@gymtracker/shared";

/** Postgres returns timestamptz as a string already; normalise to strict ISO with a Z. */
const iso = (v: string | Date): string =>
  typeof v === "string" ? new Date(v).toISOString() : v.toISOString();

export type ExerciseRow = {
  id: number;
  user_id: string | null;
  name: string;
  primary_muscle_group: string;
  secondary_muscle_groups: string[] | null;
  equipment: string;
  notes: string | null;
  video_url: string | null;
  created_at: string;
};

export const toExercise = (r: ExerciseRow): ExerciseDto => ({
  id: r.id,
  name: r.name,
  primaryMuscleGroup: r.primary_muscle_group as ExerciseDto["primaryMuscleGroup"],
  secondaryMuscleGroups: (r.secondary_muscle_groups ??
    []) as ExerciseDto["secondaryMuscleGroups"],
  equipment: r.equipment as ExerciseDto["equipment"],
  notes: r.notes,
  videoUrl: r.video_url,
  // A global catalog row has no owner; anything owned is the user's own creation.
  isCustom: r.user_id !== null,
  createdAt: iso(r.created_at),
});

export const toExerciseSetHistory = (r: {
  id: number;
  workout_id: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_warmup: boolean;
  is_pr: boolean;
  completed_at: string;
  workout_date: string;
}): ExerciseSetHistoryDto => ({
  id: r.id,
  workoutId: r.workout_id,
  weight: r.weight,
  reps: r.reps,
  rpe: r.rpe,
  isWarmup: r.is_warmup,
  isPr: r.is_pr,
  completedAt: iso(r.completed_at),
  workoutDate: iso(r.workout_date),
});

export const toLastTimeSet = (r: {
  id: number;
  workout_id: number;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_warmup: boolean;
  workout_date: string;
}): LastTimeSetDto => ({
  id: r.id,
  workoutId: r.workout_id,
  setNumber: r.set_number,
  weight: r.weight,
  reps: r.reps,
  rpe: r.rpe,
  isWarmup: r.is_warmup,
  workoutDate: iso(r.workout_date),
});

export type RoutineExerciseRow = {
  id: number;
  sort_order: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  target_rpe: number | null;
  rest_seconds: number;
  group_id: string | null;
  group_type: string | null;
  exercise_id: number;
  exercises: { name: string; primary_muscle_group: string } | null;
};

export const toRoutineExercise = (r: RoutineExerciseRow): RoutineExerciseDto => ({
  id: r.id,
  sortOrder: r.sort_order,
  targetSets: r.target_sets,
  targetRepsMin: r.target_reps_min,
  targetRepsMax: r.target_reps_max,
  targetRpe: r.target_rpe,
  restSeconds: r.rest_seconds,
  groupId: r.group_id,
  groupType: r.group_type as RoutineExerciseDto["groupType"],
  exerciseId: r.exercise_id,
  exerciseName: r.exercises?.name ?? "",
  primaryMuscleGroup: r.exercises
    ?.primary_muscle_group as RoutineExerciseDto["primaryMuscleGroup"],
});

export type WorkoutRow = {
  id: number;
  date: string;
  routine_id: number | null;
  notes: string | null;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
};

export const toWorkout = (r: WorkoutRow): WorkoutDto => ({
  id: r.id,
  date: iso(r.date),
  routineId: r.routine_id,
  notes: r.notes,
  startedAt: iso(r.started_at),
  finishedAt: r.finished_at ? iso(r.finished_at) : null,
  durationSeconds: r.duration_seconds,
});

export type WorkoutSetRow = {
  id: number;
  workout_id: number;
  exercise_id: number;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_warmup: boolean;
  is_pr: boolean;
  group_id: string | null;
  completed_at: string;
  exercises?: { name: string } | null;
};

export const toWorkoutSet = (r: WorkoutSetRow): WorkoutSetDto => ({
  id: r.id,
  workoutId: r.workout_id,
  exerciseId: r.exercise_id,
  exerciseName: r.exercises?.name ?? "",
  setNumber: r.set_number,
  weight: r.weight,
  reps: r.reps,
  rpe: r.rpe,
  isWarmup: r.is_warmup,
  isPr: r.is_pr,
  groupId: r.group_id,
  completedAt: iso(r.completed_at),
});

export const toBodyStat = (r: {
  id: number;
  date: string;
  weight_kg: number | null;
  measurements: Record<string, number> | null;
  photo_url: string | null;
  notes: string | null;
}): BodyStatDto => ({
  id: r.id,
  // Already YYYY-MM-DD from a Postgres `date` column. Deliberately not passed through Date,
  // which would reintroduce the timezone shift this column was changed to fix.
  date: r.date,
  weightKg: r.weight_kg,
  measurements: r.measurements,
  photoUrl: r.photo_url,
  notes: r.notes,
});

export const toSplitDay = (r: {
  day_of_week: number;
  label: string | null;
  routine_id: number | null;
  routines: { name: string } | null;
}): SplitDayDto => ({
  dayOfWeek: r.day_of_week,
  label: r.label ?? "",
  routineId: r.routine_id,
  routineName: r.routines?.name ?? null,
});

export const toSettings = (r: {
  weight_unit: string;
  default_rest_seconds: number;
  timezone: string;
}): SettingsDto => ({
  weightUnit: r.weight_unit as SettingsDto["weightUnit"],
  defaultRestSeconds: r.default_rest_seconds,
  timezone: r.timezone,
});
