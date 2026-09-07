import type { RequestHandler } from "express";
import { z } from "zod";
import { ApiError } from "./error.js";

/** Parses and replaces req.body, so handlers receive validated, defaulted data. */
export const validateBody =
  <T extends z.ZodTypeAny>(schema: T): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };

/** Parses req.query into res.locals.query; req.query is read-only in Express 5. */
export const validateQuery =
  <T extends z.ZodTypeAny>(schema: T): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    res.locals.query = result.data;
    next();
  };

const idSchema = z.coerce.number().int().positive();

/** Route params are strings; ids must be positive integers or the route does not match. */
export function paramId(
  value: string | string[] | undefined,
  name = "id",
): number {
  const result = idSchema.safeParse(Array.isArray(value) ? value[0] : value);
  if (!result.success) {
    throw new ApiError(400, "INVALID_ID", `${name} must be a positive integer`);
  }
  return result.data;
}
