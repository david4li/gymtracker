/**
 * Sample routine templates, resolved against exercise names at seed time
 * (see lib/db/seed.ts) so this file doesn't need to know exercise ids.
 */
export type RoutineExerciseSeed = {
  exerciseName: string;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRpe?: number;
  restSeconds: number;
};

export type RoutineSeed = {
  name: string;
  description: string;
  exercises: RoutineExerciseSeed[];
};

export const routineSeedData: RoutineSeed[] = [
  {
    name: "Push Day",
    description: "Chest, shoulders, and triceps.",
    exercises: [
      { exerciseName: "Barbell Bench Press", order: 1, targetSets: 4, targetRepsMin: 5, targetRepsMax: 8, targetRpe: 8, restSeconds: 150 },
      { exerciseName: "Incline Dumbbell Press", order: 2, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, targetRpe: 8, restSeconds: 120 },
      { exerciseName: "Overhead Press", order: 3, targetSets: 3, targetRepsMin: 6, targetRepsMax: 10, targetRpe: 8, restSeconds: 120 },
      { exerciseName: "Lateral Raise", order: 4, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 },
      { exerciseName: "Tricep Pushdown", order: 5, targetSets: 3, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60 },
      { exerciseName: "Dips", order: 6, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90 },
    ],
  },
  {
    name: "Pull Day",
    description: "Back, biceps, and rear delts.",
    exercises: [
      { exerciseName: "Deadlift", order: 1, targetSets: 3, targetRepsMin: 3, targetRepsMax: 5, targetRpe: 8, restSeconds: 180 },
      { exerciseName: "Pull-Up", order: 2, targetSets: 4, targetRepsMin: 6, targetRepsMax: 10, restSeconds: 120 },
      { exerciseName: "Barbell Row", order: 3, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRpe: 8, restSeconds: 120 },
      { exerciseName: "Seated Cable Row", order: 4, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90 },
      { exerciseName: "Face Pull", order: 5, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 },
      { exerciseName: "Barbell Curl", order: 6, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 60 },
    ],
  },
  {
    name: "Leg Day",
    description: "Quads, hamstrings, glutes, and calves.",
    exercises: [
      { exerciseName: "Back Squat", order: 1, targetSets: 4, targetRepsMin: 5, targetRepsMax: 8, targetRpe: 8, restSeconds: 180 },
      { exerciseName: "Romanian Deadlift", order: 2, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetRpe: 8, restSeconds: 120 },
      { exerciseName: "Leg Press", order: 3, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 120 },
      { exerciseName: "Leg Extension", order: 4, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 },
      { exerciseName: "Lying Leg Curl", order: 5, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 },
      { exerciseName: "Standing Calf Raise", order: 6, targetSets: 4, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60 },
    ],
  },
];
