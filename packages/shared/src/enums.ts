// Fixed vocabularies shared by the frontend, the API, and the database check constraints.
//
// These are the single source of truth. The Postgres schema mirrors them as `check (col in (...))`
// rather than native enum types, so adding a value here is a one-line migration instead of an
// ALTER TYPE. Keep the two in sync when adding a value.

export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "full_body",
  "cardio",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT_TYPES = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
  "band",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export const GROUP_TYPES = ["superset", "circuit", "dropset"] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

export const WEIGHT_UNITS = ["kg", "lbs"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const PERIODIZATION_SCHEMES = ["linear", "undulating", "block"] as const;
export type PeriodizationScheme = (typeof PERIODIZATION_SCHEMES)[number];
