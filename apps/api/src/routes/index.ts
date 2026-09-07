import { Router } from "express";
import { z } from "zod";
import {
  bodyStatInputSchema,
  dayOfWeekSchema,
  finishWorkoutSchema,
  logSetInputSchema,
  routineInputSchema,
  setSplitDayInputSchema,
  settingsInputSchema,
  startWorkoutSchema,
  updateSetInputSchema,
} from "@gymtracker/shared";
import { paramId, validateBody } from "../middleware/validate.js";
import * as routinesService from "../services/routines.js";
import * as workoutsService from "../services/workouts.js";
import * as bodyStatsService from "../services/bodyStats.js";
import * as programmingService from "../services/programming.js";
import * as analyticsService from "../services/analytics.js";
import * as settingsService from "../services/settings.js";

const intQuery = (max: number, fallback: number) =>
  z.coerce.number().int().min(1).max(max).default(fallback);

// ---------- Routines ----------

export const routinesRouter = Router();

routinesRouter.get("/", async (req, res) => {
  res.json(await routinesService.listRoutines(req.supabase));
});

routinesRouter.get("/:id", async (req, res) => {
  res.json(await routinesService.getRoutine(req.supabase, paramId(req.params.id)));
});

routinesRouter.post("/", validateBody(routineInputSchema), async (req, res) => {
  const created = await routinesService.createRoutine(
    req.supabase,
    req.user.id,
    req.body,
  );
  res.status(201).json(created);
});

routinesRouter.put("/:id", validateBody(routineInputSchema), async (req, res) => {
  res.json(
    await routinesService.updateRoutine(
      req.supabase,
      req.user.id,
      paramId(req.params.id),
      req.body,
    ),
  );
});

routinesRouter.delete("/:id", async (req, res) => {
  await routinesService.deleteRoutine(req.supabase, paramId(req.params.id));
  res.status(204).end();
});

// ---------- Workouts ----------

export const workoutsRouter = Router();

// Declared before "/:id" so "active" is not parsed as an id.
workoutsRouter.get("/active", async (req, res) => {
  res.json(await workoutsService.getActiveWorkout(req.supabase));
});

workoutsRouter.get("/", async (req, res) => {
  const status = z
    .enum(["finished", "active"])
    .optional()
    .parse(req.query.status ?? undefined);
  const limit = intQuery(500, 100).parse(req.query.limit ?? undefined);
  const summary = req.query.summary === "true";
  res.json(await workoutsService.listWorkouts(req.supabase, { status, limit, summary }));
});

workoutsRouter.get("/:id", async (req, res) => {
  res.json(await workoutsService.getWorkout(req.supabase, paramId(req.params.id)));
});

workoutsRouter.post("/", validateBody(startWorkoutSchema), async (req, res) => {
  const created = await workoutsService.startWorkout(
    req.supabase,
    req.user.id,
    req.body.routineId ?? null,
  );
  res.status(201).json(created);
});

workoutsRouter.post(
  "/:id/finish",
  validateBody(finishWorkoutSchema),
  async (req, res) => {
    res.json(
      await workoutsService.finishWorkout(
        req.supabase,
        paramId(req.params.id),
        req.body.notes ?? null,
      ),
    );
  },
);

workoutsRouter.patch("/:id", async (req, res) => {
  const body = z.object({ notes: z.string().max(2000).nullish() }).parse(req.body);
  res.json(
    await workoutsService.updateWorkout(
      req.supabase,
      paramId(req.params.id),
      body.notes ?? null,
    ),
  );
});

workoutsRouter.delete("/:id", async (req, res) => {
  await workoutsService.deleteWorkout(req.supabase, paramId(req.params.id));
  res.status(204).end();
});

// Sets are created under their workout, since that is what owns them.
workoutsRouter.post(
  "/:workoutId/sets",
  validateBody(logSetInputSchema),
  async (req, res) => {
    const created = await workoutsService.logSet(
      req.supabase,
      req.user.id,
      paramId(req.params.workoutId, "workoutId"),
      req.body,
    );
    res.status(201).json(created);
  },
);

// ---------- Sets (addressed directly once they exist) ----------

export const setsRouter = Router();

setsRouter.patch("/:id", validateBody(updateSetInputSchema), async (req, res) => {
  res.json(await workoutsService.updateSet(req.supabase, paramId(req.params.id), req.body));
});

setsRouter.delete("/:id", async (req, res) => {
  await workoutsService.deleteSet(req.supabase, paramId(req.params.id));
  res.status(204).end();
});

// ---------- Body stats ----------

export const bodyStatsRouter = Router();

bodyStatsRouter.get("/", async (req, res) => {
  res.json(await bodyStatsService.listBodyStats(req.supabase));
});

bodyStatsRouter.get("/:id", async (req, res) => {
  res.json(await bodyStatsService.getBodyStat(req.supabase, paramId(req.params.id)));
});

bodyStatsRouter.post("/", validateBody(bodyStatInputSchema), async (req, res) => {
  const created = await bodyStatsService.createBodyStat(
    req.supabase,
    req.user.id,
    req.body,
  );
  res.status(201).json(created);
});

bodyStatsRouter.patch("/:id", validateBody(bodyStatInputSchema), async (req, res) => {
  res.json(
    await bodyStatsService.updateBodyStat(req.supabase, paramId(req.params.id), req.body),
  );
});

bodyStatsRouter.delete("/:id", async (req, res) => {
  await bodyStatsService.deleteBodyStat(req.supabase, paramId(req.params.id));
  res.status(204).end();
});

// ---------- Programming ----------

export const splitRouter = Router();

splitRouter.get("/", async (req, res) => {
  res.json(await programmingService.getWeeklySplit(req.supabase));
});

splitRouter.put(
  "/:dayOfWeek",
  validateBody(setSplitDayInputSchema),
  async (req, res) => {
    const day = dayOfWeekSchema.parse(req.params.dayOfWeek);
    res.json(
      await programmingService.setSplitDay(req.supabase, req.user.id, day, req.body),
    );
  },
);

// ---------- Analytics ----------

export const analyticsRouter = Router();

analyticsRouter.get("/volume/weekly", async (req, res) => {
  const weeks = intQuery(52, 8).parse(req.query.weeks ?? undefined);
  res.json(await analyticsService.getWeeklyVolume(req.supabase, weeks));
});

analyticsRouter.get("/muscle-balance", async (req, res) => {
  const weeks = intQuery(52, 4).parse(req.query.weeks ?? undefined);
  res.json(await analyticsService.getMuscleBalance(req.supabase, weeks));
});

analyticsRouter.get("/prs", async (req, res) => {
  const limit = intQuery(200, 25).parse(req.query.limit ?? undefined);
  res.json(await analyticsService.getPRList(req.supabase, limit));
});

analyticsRouter.get("/exercises/:id", async (req, res) => {
  res.json(
    await analyticsService.getExerciseAnalytics(req.supabase, paramId(req.params.id)),
  );
});

// ---------- Settings ----------

export const settingsRouter = Router();

settingsRouter.get("/", async (req, res) => {
  res.json(await settingsService.getSettings(req.supabase));
});

settingsRouter.put("/", validateBody(settingsInputSchema), async (req, res) => {
  res.json(await settingsService.updateSettings(req.supabase, req.user.id, req.body));
});

settingsRouter.post("/reset", async (req, res) => {
  await settingsService.resetAllData(req.supabase, req.user.id);
  res.status(204).end();
});
