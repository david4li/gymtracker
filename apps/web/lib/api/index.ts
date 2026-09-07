import "server-only";
import type {
  BodyStatDto,
  Equipment,
  ExerciseAnalyticsDto,
  ExerciseDto,
  ExerciseSetHistoryDto,
  LastTimeSetDto,
  MuscleBalanceDto,
  MuscleGroup,
  PrDto,
  RoutineDetailDto,
  RoutineListItemDto,
  SettingsDto,
  SplitDayDto,
  WeeklyVolumeDto,
  WorkoutDetailDto,
  WorkoutDto,
  WorkoutSummaryDto,
} from "@gymtracker/shared";
import { api, qs } from "./fetcher";
import { toDate, toDateOrNull, toLocalDay } from "./revive";

// These functions deliberately mirror the names and return shapes of the old lib/queries/*
// modules, so pages change only their import path. Dates are revived on the way through.

// ---------- Exercises ----------

const reviveExercise = (e: ExerciseDto) => ({ ...e, createdAt: toDate(e.createdAt) });

export type Exercise = ReturnType<typeof reviveExercise>;

export async function listExercises(filters?: {
  search?: string;
  muscleGroup?: MuscleGroup | "all";
  equipment?: Equipment | "all";
}): Promise<Exercise[]> {
  const rows = await api.get<ExerciseDto[]>(
    `/exercises${qs({
      search: filters?.search,
      muscleGroup: filters?.muscleGroup,
      equipment: filters?.equipment,
    })}`,
  );
  return rows.map(reviveExercise);
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  try {
    return reviveExercise(await api.get<ExerciseDto>(`/exercises/${id}`));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function getExerciseSetHistory(exerciseId: number, limit = 200) {
  const rows = await api.get<ExerciseSetHistoryDto[]>(
    `/exercises/${exerciseId}/sets${qs({ limit })}`,
  );
  return rows.map((s) => ({
    ...s,
    completedAt: toDate(s.completedAt),
    workoutDate: toDate(s.workoutDate),
  }));
}

export async function getLastTimeSets(exerciseId: number, excludeWorkoutId?: number) {
  const rows = await api.get<LastTimeSetDto[] | null>(
    `/exercises/${exerciseId}/last-time${qs({ excludeWorkoutId })}`,
  );
  if (!rows) return null;
  return rows.map((s) => ({ ...s, workoutDate: toDate(s.workoutDate) }));
}

// ---------- Routines ----------

const reviveRoutineMeta = <T extends RoutineListItemDto>(r: T) => ({
  ...r,
  createdAt: toDate(r.createdAt),
  updatedAt: toDate(r.updatedAt),
});

export async function listRoutines() {
  const rows = await api.get<RoutineListItemDto[]>("/routines");
  return rows.map(reviveRoutineMeta);
}

export async function listRoutinesForSelect() {
  const rows = await api.get<RoutineListItemDto[]>("/routines");
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function getRoutineWithExercises(id: number) {
  try {
    const routine = await api.get<RoutineDetailDto>(`/routines/${id}`);
    return reviveRoutineMeta(routine);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

// ---------- Workouts ----------

const reviveWorkout = <T extends WorkoutDto>(w: T) => ({
  ...w,
  date: toDate(w.date),
  startedAt: toDate(w.startedAt),
  finishedAt: toDateOrNull(w.finishedAt),
});

export async function getActiveWorkout() {
  const workout = await api.get<WorkoutDto | null>("/workouts/active");
  return workout ? reviveWorkout(workout) : null;
}

export async function getWorkoutWithSets(id: number) {
  try {
    const workout = await api.get<WorkoutDetailDto>(`/workouts/${id}`);
    return {
      ...reviveWorkout(workout),
      sets: workout.sets.map((s) => ({ ...s, completedAt: toDate(s.completedAt) })),
    };
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function getWorkoutHistory(limit = 100) {
  const rows = await api.get<WorkoutSummaryDto[]>(
    `/workouts${qs({ status: "finished", limit, summary: true })}`,
  );
  return rows.map(reviveWorkout);
}

export async function getRecentFinishedWorkouts(limit = 30) {
  const rows = await api.get<WorkoutDto[]>(
    `/workouts${qs({ status: "finished", limit })}`,
  );
  return rows.map(reviveWorkout);
}

// ---------- Body stats ----------

const reviveBodyStat = (b: BodyStatDto) => ({ ...b, date: toLocalDay(b.date) });

export async function listBodyStats() {
  const rows = await api.get<BodyStatDto[]>("/body-stats");
  return rows.map(reviveBodyStat);
}

export async function getBodyStatById(id: number) {
  try {
    return reviveBodyStat(await api.get<BodyStatDto>(`/body-stats/${id}`));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

// ---------- Analytics ----------

export async function getWeeklyVolumeByMuscleGroup(weeksBack = 8) {
  return api.get<WeeklyVolumeDto[]>(`/analytics/volume/weekly${qs({ weeks: weeksBack })}`);
}

export async function getMuscleBalance(weeksBack = 4) {
  return api.get<MuscleBalanceDto[]>(`/analytics/muscle-balance${qs({ weeks: weeksBack })}`);
}

export async function getPRList(limit = 25) {
  const rows = await api.get<PrDto[]>(`/analytics/prs${qs({ limit })}`);
  return rows.map((pr) => ({ ...pr, date: toDate(pr.date) }));
}

/** Trend and plateau arrive together: the plateau verdict is derived from the same series. */
export async function getExerciseAnalytics(exerciseId: number) {
  return api.get<ExerciseAnalyticsDto>(`/analytics/exercises/${exerciseId}`);
}

export async function getStrengthTrend(exerciseId: number) {
  return (await getExerciseAnalytics(exerciseId)).trend;
}

export async function getPlateauStatus(exerciseId: number) {
  return (await getExerciseAnalytics(exerciseId)).plateau;
}

// ---------- Programming ----------

export async function getWeeklySplit() {
  return api.get<SplitDayDto[]>("/split");
}

// ---------- Settings ----------

export async function getSettings() {
  return api.get<SettingsDto>("/settings");
}

// ---------- Helpers ----------

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 404
  );
}
