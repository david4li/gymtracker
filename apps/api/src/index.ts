import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requestLogger } from "./middleware/log.js";
import { exercisesRouter } from "./routes/exercises.js";
import {
  analyticsRouter,
  bodyStatsRouter,
  routinesRouter,
  setsRouter,
  settingsRouter,
  splitRouter,
  workoutsRouter,
} from "./routes/index.js";

const app = express();

// Render terminates TLS at its proxy; without this, req.ip and secure-cookie logic see the
// proxy rather than the client.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Normally a no-op: the Next.js server calls this API server-to-server, so there is no
// browser origin to allow. Configured only as an escape hatch.
if (env.ALLOWED_ORIGINS.length > 0) {
  app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }));
}

app.use(requestLogger);
app.use(express.json({ limit: "1mb" }));

// Unauthenticated. Render polls this for health checks.
app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

const v1 = express.Router();
v1.use(requireAuth);

// Smoke test for the auth middleware, and a cheap way to confirm a token from the frontend.
v1.get("/me", (req, res) => {
  res.json({ id: req.user.id, email: req.user.email ?? null });
});

v1.use("/exercises", exercisesRouter);
v1.use("/routines", routinesRouter);
v1.use("/workouts", workoutsRouter);
v1.use("/sets", setsRouter);
v1.use("/body-stats", bodyStatsRouter);
v1.use("/split", splitRouter);
v1.use("/analytics", analyticsRouter);
v1.use("/settings", settingsRouter);

app.use("/api/v1", v1);

app.use(notFoundHandler);
app.use(errorHandler);

// Bind 0.0.0.0, not localhost: Render routes traffic to the container's external interface.
const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`[api] listening on :${env.PORT} (${env.NODE_ENV})`);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
