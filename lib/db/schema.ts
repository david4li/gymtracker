import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------- Fixed vocabularies (small + single-user, so plain TS unions rather than lookup tables) ----------

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

// ---------- Exercises ----------

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  primaryMuscleGroup: text("primary_muscle_group", { enum: MUSCLE_GROUPS }).notNull(),
  secondaryMuscleGroups: text("secondary_muscle_groups", { mode: "json" })
    .$type<MuscleGroup[]>()
    .notNull()
    .default(sql`'[]'`),
  equipment: text("equipment", { enum: EQUIPMENT_TYPES }).notNull(),
  notes: text("notes"),
  videoUrl: text("video_url"),
  isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const exercisesRelations = relations(exercises, ({ many }) => ({
  routineExercises: many(routineExercises),
  workoutSets: many(workoutSets),
}));

// ---------- Routines (templates) ----------

export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const routineExercises = sqliteTable(
  "routine_exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    routineId: integer("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    order: integer("order").notNull(),
    targetSets: integer("target_sets").notNull().default(3),
    targetRepsMin: integer("target_reps_min").notNull().default(8),
    targetRepsMax: integer("target_reps_max").notNull().default(12),
    targetRpe: real("target_rpe"),
    restSeconds: integer("rest_seconds").notNull().default(90),
    // A shared groupId ties several routine exercises into a superset/circuit/drop-set;
    // groupType describes what kind of group it is. Null groupId = a standalone exercise.
    groupId: text("group_id"),
    groupType: text("group_type", { enum: GROUP_TYPES }),
  },
  (t) => [index("routine_exercises_routine_idx").on(t.routineId)],
);

export const routinesRelations = relations(routines, ({ many }) => ({
  routineExercises: many(routineExercises),
  workouts: many(workouts),
  weeklySplitDays: many(weeklySplitDays),
}));

export const routineExercisesRelations = relations(routineExercises, ({ one }) => ({
  routine: one(routines, { fields: [routineExercises.routineId], references: [routines.id] }),
  exercise: one(exercises, { fields: [routineExercises.exerciseId], references: [exercises.id] }),
}));

// ---------- Workouts (logged sessions) ----------

export const workouts = sqliteTable("workouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  routineId: integer("routine_id").references(() => routines.id, { onDelete: "set null" }),
  notes: text("notes"),
  startedAt: integer("started_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  // NULL finishedAt means this workout is the currently-active/in-progress one.
  finishedAt: integer("finished_at", { mode: "timestamp" }),
  durationSeconds: integer("duration_seconds"),
});

export const workoutSets = sqliteTable(
  "workout_sets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    setNumber: integer("set_number").notNull(),
    weight: real("weight").notNull(),
    reps: integer("reps").notNull(),
    rpe: real("rpe"),
    isWarmup: integer("is_warmup", { mode: "boolean" }).notNull().default(false),
    isPr: integer("is_pr", { mode: "boolean" }).notNull().default(false),
    // Ad-hoc superset/circuit/drop-set grouping while logging (mirrors routineExercises.groupId).
    groupId: text("group_id"),
    completedAt: integer("completed_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("workout_sets_workout_idx").on(t.workoutId),
    index("workout_sets_exercise_idx").on(t.exerciseId),
  ],
);

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  routine: one(routines, { fields: [workouts.routineId], references: [routines.id] }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workout: one(workouts, { fields: [workoutSets.workoutId], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutSets.exerciseId], references: [exercises.id] }),
}));

// ---------- Body stats ----------

export const bodyStats = sqliteTable("body_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  weightKg: real("weight_kg"),
  measurements: text("measurements", { mode: "json" }).$type<Record<string, number>>(),
  photoUrl: text("photo_url"),
  notes: text("notes"),
});

// ---------- Programming tools ----------

// Simple day-of-week -> routine assignment for the weekly split builder (0 = Sunday .. 6 = Saturday).
export const weeklySplitDays = sqliteTable("weekly_split_days", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayOfWeek: integer("day_of_week").notNull(),
  label: text("label"),
  routineId: integer("routine_id").references(() => routines.id, { onDelete: "set null" }),
});

export const weeklySplitDaysRelations = relations(weeklySplitDays, ({ one }) => ({
  routine: one(routines, { fields: [weeklySplitDays.routineId], references: [routines.id] }),
}));

// ---------- Settings (singleton row, id is always 1) ----------

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey().default(1),
  weightUnit: text("weight_unit", { enum: WEIGHT_UNITS }).notNull().default("lbs"),
  defaultRestSeconds: integer("default_rest_seconds").notNull().default(90),
});
