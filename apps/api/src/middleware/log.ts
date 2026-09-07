import type { RequestHandler } from "express";

/**
 * One line per request, written when the response finishes so it can include the status
 * and duration. Deliberately hand-rolled rather than pulling in morgan: it is a dozen lines,
 * and it lets the auth'd user id appear, which is the field most worth having when debugging
 * row-level security.
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const who = req.user?.id ? req.user.id.slice(0, 8) : "anon";
    const colour =
      res.statusCode >= 500 ? "\x1b[31m" : res.statusCode >= 400 ? "\x1b[33m" : "\x1b[32m";

    console.log(
      `${colour}${res.statusCode}\x1b[0m ${req.method.padEnd(6)} ${req.originalUrl}` +
        `  ${ms.toFixed(1)}ms  [${who}]`,
    );
  });

  next();
};
