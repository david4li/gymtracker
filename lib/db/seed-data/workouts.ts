/**
 * Sample finished workouts, dated relative to seed time (not hardcoded dates) so
 * history/analytics pages have real data to render immediately after `npm run db:seed`,
 * independent of when the seed is actually run. Weights are in lbs (the default unit).
 *
 * `isPr` is intentionally NOT set here — lib/db/seed.ts inserts these sets in
 * chronological order through the same `detectPr` logic the app uses at log-time,
 * so seeded PR flags stay consistent with real usage.
 */
export type WorkoutSetSeed = {
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
};

export type WorkoutSeed = {
  daysAgo: number;
  routineName: string;
  notes?: string;
  durationSeconds: number;
  sets: WorkoutSetSeed[];
};

export const workoutSeedData: WorkoutSeed[] = [
  {
    daysAgo: 18,
    routineName: "Push Day",
    durationSeconds: 3300,
    sets: [
      { exerciseName: "Barbell Bench Press", setNumber: 1, weight: 95, reps: 10, isWarmup: true },
      { exerciseName: "Barbell Bench Press", setNumber: 2, weight: 135, reps: 8, rpe: 7 },
      { exerciseName: "Barbell Bench Press", setNumber: 3, weight: 155, reps: 6, rpe: 8 },
      { exerciseName: "Barbell Bench Press", setNumber: 4, weight: 155, reps: 5, rpe: 8.5 },
      { exerciseName: "Incline Dumbbell Press", setNumber: 1, weight: 50, reps: 10, rpe: 7 },
      { exerciseName: "Incline Dumbbell Press", setNumber: 2, weight: 50, reps: 10, rpe: 8 },
      { exerciseName: "Incline Dumbbell Press", setNumber: 3, weight: 50, reps: 9, rpe: 8 },
      { exerciseName: "Overhead Press", setNumber: 1, weight: 65, reps: 8, rpe: 7 },
      { exerciseName: "Overhead Press", setNumber: 2, weight: 65, reps: 8, rpe: 8 },
      { exerciseName: "Overhead Press", setNumber: 3, weight: 65, reps: 7, rpe: 8.5 },
      { exerciseName: "Lateral Raise", setNumber: 1, weight: 15, reps: 15 },
      { exerciseName: "Lateral Raise", setNumber: 2, weight: 15, reps: 15 },
      { exerciseName: "Lateral Raise", setNumber: 3, weight: 15, reps: 12 },
      { exerciseName: "Tricep Pushdown", setNumber: 1, weight: 50, reps: 15 },
      { exerciseName: "Tricep Pushdown", setNumber: 2, weight: 50, reps: 14 },
    ],
  },
  {
    daysAgo: 15,
    routineName: "Pull Day",
    durationSeconds: 3600,
    sets: [
      { exerciseName: "Deadlift", setNumber: 1, weight: 135, reps: 5, isWarmup: true },
      { exerciseName: "Deadlift", setNumber: 2, weight: 225, reps: 5, rpe: 7.5 },
      { exerciseName: "Deadlift", setNumber: 3, weight: 225, reps: 5, rpe: 8 },
      { exerciseName: "Deadlift", setNumber: 4, weight: 225, reps: 4, rpe: 8.5 },
      { exerciseName: "Pull-Up", setNumber: 1, weight: 0, reps: 8, rpe: 7 },
      { exerciseName: "Pull-Up", setNumber: 2, weight: 0, reps: 8, rpe: 8 },
      { exerciseName: "Pull-Up", setNumber: 3, weight: 0, reps: 6, rpe: 8.5 },
      { exerciseName: "Barbell Row", setNumber: 1, weight: 95, reps: 10, rpe: 7 },
      { exerciseName: "Barbell Row", setNumber: 2, weight: 95, reps: 10, rpe: 8 },
      { exerciseName: "Barbell Row", setNumber: 3, weight: 95, reps: 9, rpe: 8 },
      { exerciseName: "Seated Cable Row", setNumber: 1, weight: 100, reps: 12 },
      { exerciseName: "Seated Cable Row", setNumber: 2, weight: 100, reps: 12 },
      { exerciseName: "Seated Cable Row", setNumber: 3, weight: 100, reps: 10 },
      { exerciseName: "Face Pull", setNumber: 1, weight: 40, reps: 15 },
      { exerciseName: "Face Pull", setNumber: 2, weight: 40, reps: 15 },
      { exerciseName: "Barbell Curl", setNumber: 1, weight: 45, reps: 10 },
      { exerciseName: "Barbell Curl", setNumber: 2, weight: 45, reps: 10 },
      { exerciseName: "Barbell Curl", setNumber: 3, weight: 45, reps: 8 },
    ],
  },
  {
    daysAgo: 12,
    routineName: "Leg Day",
    durationSeconds: 3900,
    sets: [
      { exerciseName: "Back Squat", setNumber: 1, weight: 95, reps: 10, isWarmup: true },
      { exerciseName: "Back Squat", setNumber: 2, weight: 185, reps: 6, rpe: 7.5 },
      { exerciseName: "Back Squat", setNumber: 3, weight: 185, reps: 6, rpe: 8 },
      { exerciseName: "Back Squat", setNumber: 4, weight: 185, reps: 5, rpe: 8.5 },
      { exerciseName: "Romanian Deadlift", setNumber: 1, weight: 135, reps: 10, rpe: 7 },
      { exerciseName: "Romanian Deadlift", setNumber: 2, weight: 135, reps: 10, rpe: 8 },
      { exerciseName: "Romanian Deadlift", setNumber: 3, weight: 135, reps: 8, rpe: 8 },
      { exerciseName: "Leg Press", setNumber: 1, weight: 270, reps: 12 },
      { exerciseName: "Leg Press", setNumber: 2, weight: 270, reps: 12 },
      { exerciseName: "Leg Press", setNumber: 3, weight: 270, reps: 10 },
      { exerciseName: "Leg Extension", setNumber: 1, weight: 90, reps: 15 },
      { exerciseName: "Leg Extension", setNumber: 2, weight: 90, reps: 14 },
      { exerciseName: "Lying Leg Curl", setNumber: 1, weight: 70, reps: 12 },
      { exerciseName: "Lying Leg Curl", setNumber: 2, weight: 70, reps: 12 },
      { exerciseName: "Standing Calf Raise", setNumber: 1, weight: 150, reps: 15 },
      { exerciseName: "Standing Calf Raise", setNumber: 2, weight: 150, reps: 15 },
      { exerciseName: "Standing Calf Raise", setNumber: 3, weight: 150, reps: 15 },
    ],
  },
  {
    daysAgo: 8,
    routineName: "Push Day",
    notes: "Felt strong today, pushed the bench a bit heavier.",
    durationSeconds: 3300,
    sets: [
      { exerciseName: "Barbell Bench Press", setNumber: 1, weight: 95, reps: 10, isWarmup: true },
      { exerciseName: "Barbell Bench Press", setNumber: 2, weight: 135, reps: 8, rpe: 7 },
      { exerciseName: "Barbell Bench Press", setNumber: 3, weight: 160, reps: 6, rpe: 8.5 },
      { exerciseName: "Barbell Bench Press", setNumber: 4, weight: 160, reps: 5, rpe: 9 },
      { exerciseName: "Incline Dumbbell Press", setNumber: 1, weight: 55, reps: 10, rpe: 8 },
      { exerciseName: "Incline Dumbbell Press", setNumber: 2, weight: 55, reps: 10, rpe: 8 },
      { exerciseName: "Incline Dumbbell Press", setNumber: 3, weight: 55, reps: 9, rpe: 8.5 },
      { exerciseName: "Overhead Press", setNumber: 1, weight: 70, reps: 8, rpe: 8 },
      { exerciseName: "Overhead Press", setNumber: 2, weight: 70, reps: 7, rpe: 8.5 },
      { exerciseName: "Overhead Press", setNumber: 3, weight: 65, reps: 8, rpe: 8 },
      { exerciseName: "Lateral Raise", setNumber: 1, weight: 15, reps: 15 },
      { exerciseName: "Lateral Raise", setNumber: 2, weight: 17.5, reps: 12 },
      { exerciseName: "Lateral Raise", setNumber: 3, weight: 17.5, reps: 12 },
      { exerciseName: "Tricep Pushdown", setNumber: 1, weight: 55, reps: 15 },
      { exerciseName: "Tricep Pushdown", setNumber: 2, weight: 55, reps: 13 },
    ],
  },
  {
    daysAgo: 5,
    routineName: "Pull Day",
    durationSeconds: 3600,
    sets: [
      { exerciseName: "Deadlift", setNumber: 1, weight: 135, reps: 5, isWarmup: true },
      { exerciseName: "Deadlift", setNumber: 2, weight: 235, reps: 5, rpe: 8 },
      { exerciseName: "Deadlift", setNumber: 3, weight: 235, reps: 5, rpe: 8.5 },
      { exerciseName: "Deadlift", setNumber: 4, weight: 235, reps: 4, rpe: 9 },
      { exerciseName: "Pull-Up", setNumber: 1, weight: 10, reps: 8, rpe: 8 },
      { exerciseName: "Pull-Up", setNumber: 2, weight: 10, reps: 6, rpe: 8.5 },
      { exerciseName: "Pull-Up", setNumber: 3, weight: 10, reps: 5, rpe: 9 },
      { exerciseName: "Barbell Row", setNumber: 1, weight: 100, reps: 10, rpe: 7.5 },
      { exerciseName: "Barbell Row", setNumber: 2, weight: 100, reps: 10, rpe: 8 },
      { exerciseName: "Barbell Row", setNumber: 3, weight: 100, reps: 8, rpe: 8.5 },
      { exerciseName: "Seated Cable Row", setNumber: 1, weight: 105, reps: 12 },
      { exerciseName: "Seated Cable Row", setNumber: 2, weight: 105, reps: 11 },
      { exerciseName: "Face Pull", setNumber: 1, weight: 40, reps: 15 },
      { exerciseName: "Face Pull", setNumber: 2, weight: 45, reps: 15 },
      { exerciseName: "Barbell Curl", setNumber: 1, weight: 50, reps: 10 },
      { exerciseName: "Barbell Curl", setNumber: 2, weight: 50, reps: 8 },
    ],
  },
  {
    daysAgo: 2,
    routineName: "Leg Day",
    durationSeconds: 3900,
    sets: [
      { exerciseName: "Back Squat", setNumber: 1, weight: 95, reps: 10, isWarmup: true },
      { exerciseName: "Back Squat", setNumber: 2, weight: 195, reps: 6, rpe: 8 },
      { exerciseName: "Back Squat", setNumber: 3, weight: 195, reps: 5, rpe: 8.5 },
      { exerciseName: "Back Squat", setNumber: 4, weight: 195, reps: 5, rpe: 9 },
      { exerciseName: "Romanian Deadlift", setNumber: 1, weight: 145, reps: 10, rpe: 8 },
      { exerciseName: "Romanian Deadlift", setNumber: 2, weight: 145, reps: 9, rpe: 8.5 },
      { exerciseName: "Leg Press", setNumber: 1, weight: 290, reps: 12 },
      { exerciseName: "Leg Press", setNumber: 2, weight: 290, reps: 10 },
      { exerciseName: "Leg Extension", setNumber: 1, weight: 95, reps: 15 },
      { exerciseName: "Leg Extension", setNumber: 2, weight: 95, reps: 12 },
      { exerciseName: "Lying Leg Curl", setNumber: 1, weight: 75, reps: 12 },
      { exerciseName: "Lying Leg Curl", setNumber: 2, weight: 75, reps: 10 },
      { exerciseName: "Standing Calf Raise", setNumber: 1, weight: 160, reps: 15 },
      { exerciseName: "Standing Calf Raise", setNumber: 2, weight: 160, reps: 14 },
    ],
  },
];
