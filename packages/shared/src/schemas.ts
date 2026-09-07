// Request schemas shared by the Express API (which validates incoming JSON) and the Next.js
// server actions (which validate before forwarding). One definition, so the two cannot drift.
//
// These describe the *wire* shape: JSON, camelCase, weights always in kilograms. Form-specific
// concerns such as coercing strings from FormData or treating "" as absent stay in the web
// actions, which normalise before parsing against these.

import { z } from "zod";
import {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  GROUP_TYPES,
  WEIGHT_UNITS,
} from "./enums";

/** A calendar day with no time or zone, as stored in Postgres `date` columns. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date");

const optionalUrl = z.string().trim().url().max(2000).nullish();
const optionalNotes = z.string().trim().max(2000).nullish();

// ---------- Exercises ----------

export const exerciseInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  primaryMuscleGroup: z.enum(MUSCLE_GROUPS),
  secondaryMuscleGroups: z.array(z.enum(MUSCLE_GROUPS)).default([]),
  equipment: z.enum(EQUIPMENT_TYPES),
  notes: optionalNotes,
  videoUrl: optionalUrl,
});
export type ExerciseInput = z.input<typeof exerciseInputSchema>;

export const exerciseUpdateSchema = exerciseInputSchema.partial();
export type ExerciseUpdate = z.input<typeof exerciseUpdateSchema>;

export const exerciseQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  muscleGroup: z.enum(MUSCLE_GROUPS).optional(),
  equipment: z.enum(EQUIPMENT_TYPES).optional(),
});

// ---------- Routines ----------

export const routineExerciseInputSchema = z.object({
  exerciseId: z.number().int().positive(),
  // Renamed from `order`, which is a reserved word in Postgres.
  sortOrder: z.number().int().min(0),
  targetSets: z.number().int().min(1).max(20),
  targetRepsMin: z.number().int().min(1).max(100),
  targetRepsMax: z.number().int().min(1).max(100),
  targetRpe: z.number().min(1).max(10).nullish(),
  restSeconds: z.number().int().min(0).max(1800),
  groupId: z.string().max(64).nullish(),
  groupType: z.enum(GROUP_TYPES).nullish(),
});

export const routineInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(1000).nullish(),
  exercises: z
    .array(routineExerciseInputSchema)
    .min(1, "Add at least one exercise"),
});
export type RoutineInput = z.input<typeof routineInputSchema>;

// ---------- Workouts and sets ----------

export const startWorkoutSchema = z.object({
  routineId: z.number().int().positive().nullish(),
});

export const finishWorkoutSchema = z.object({
  notes: optionalNotes,
});

export const logSetInputSchema = z.object({
  exerciseId: z.number().int().positive(),
  setNumber: z.number().int().positive(),
  weight: z.number().min(0).max(3000),
  reps: z.number().int().min(0).max(1000),
  rpe: z.number().min(1).max(10).nullish(),
  isWarmup: z.boolean().default(false),
  groupId: z.string().max(64).nullish(),
});
export type LogSetInput = z.input<typeof logSetInputSchema>;

export const updateSetInputSchema = z.object({
  weight: z.number().min(0).max(3000).optional(),
  reps: z.number().int().min(0).max(1000).optional(),
  rpe: z.number().min(1).max(10).nullish(),
  isWarmup: z.boolean().optional(),
});
export type UpdateSetInput = z.input<typeof updateSetInputSchema>;

// ---------- Body stats ----------

/** Circumference measurements in centimetres, keyed by site. */
export const measurementsSchema = z.record(
  z.string().max(40),
  z.number().min(0).max(500),
);

export const bodyStatInputSchema = z.object({
  date: isoDateSchema,
  // Canonical kilograms. The lbs conversion happens in the web action, which knows the
  // user's display unit, so the API contract stays unambiguous.
  weightKg: z.number().min(0).max(1000).nullish(),
  measurements: measurementsSchema.nullish(),
  photoUrl: optionalUrl,
  notes: optionalNotes,
});
export type BodyStatInput = z.input<typeof bodyStatInputSchema>;

// ---------- Programming ----------

export const setSplitDayInputSchema = z.object({
  label: z.string().trim().max(60).nullish(),
  routineId: z.number().int().positive().nullable(),
});
export type SetSplitDayInput = z.input<typeof setSplitDayInputSchema>;

export const dayOfWeekSchema = z.coerce.number().int().min(0).max(6);

// ---------- Settings ----------

export const settingsInputSchema = z.object({
  weightUnit: z.enum(WEIGHT_UNITS),
  defaultRestSeconds: z.number().int().min(0).max(1800),
});
export type SettingsInput = z.input<typeof settingsInputSchema>;
