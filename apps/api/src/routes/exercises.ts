import { Router } from "express";
import { z } from "zod";
import {
  exerciseInputSchema,
  exerciseQuerySchema,
  exerciseUpdateSchema,
} from "@gymtracker/shared";
import { paramId, validateBody, validateQuery } from "../middleware/validate.js";
import * as service from "../services/exercises.js";

export const exercisesRouter = Router();

// The library filters send "all" to mean "no filter"; normalise before validating so the
// frontend's existing query-string contract does not have to change.
const querySchema = z.preprocess((raw) => {
  const q = { ...(raw as Record<string, unknown>) };
  for (const key of ["muscleGroup", "equipment", "search"]) {
    if (q[key] === "all" || q[key] === "") delete q[key];
  }
  return q;
}, exerciseQuerySchema);

exercisesRouter.get("/", validateQuery(querySchema), async (req, res) => {
  res.json(await service.listExercises(req.supabase, res.locals.query));
});

exercisesRouter.get("/:id", async (req, res) => {
  res.json(await service.getExercise(req.supabase, paramId(req.params.id)));
});

exercisesRouter.get("/:id/sets", async (req, res) => {
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(500)
    .default(200)
    .parse(req.query.limit ?? undefined);
  res.json(
    await service.getExerciseSetHistory(req.supabase, paramId(req.params.id), limit),
  );
});

exercisesRouter.get("/:id/last-time", async (req, res) => {
  const exclude = req.query.excludeWorkoutId
    ? paramId(String(req.query.excludeWorkoutId), "excludeWorkoutId")
    : undefined;
  res.json(
    await service.getLastTimeSets(req.supabase, paramId(req.params.id), exclude),
  );
});

exercisesRouter.post("/", validateBody(exerciseInputSchema), async (req, res) => {
  const created = await service.createExercise(req.supabase, req.user.id, req.body);
  res.status(201).json(created);
});

exercisesRouter.patch("/:id", validateBody(exerciseUpdateSchema), async (req, res) => {
  res.json(await service.updateExercise(req.supabase, paramId(req.params.id), req.body));
});

exercisesRouter.delete("/:id", async (req, res) => {
  await service.deleteExercise(req.supabase, paramId(req.params.id));
  res.status(204).end();
});
