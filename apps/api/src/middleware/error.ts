import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../env.js";

/** An error with an HTTP status and a stable machine-readable code. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static notFound(what: string) {
    return new ApiError(404, `${what.toUpperCase()}_NOT_FOUND`, `${what} not found`);
  }
}

/** Postgres error codes worth translating into something a client can act on. */
const PG_CODE_MAP: Record<string, { status: number; code: string; message: string }> = {
  "23505": {
    status: 409,
    code: "CONFLICT",
    message: "That record already exists",
  },
  "23503": {
    status: 400,
    code: "INVALID_REFERENCE",
    message: "Referenced record does not exist",
  },
  "23514": {
    status: 400,
    code: "CONSTRAINT_VIOLATION",
    message: "A value was outside the allowed range",
  },
  // RLS rejected the write. Surfaced as "not found" rather than "forbidden" so the API does
  // not confirm the existence of another user's row.
  "42501": {
    status: 404,
    code: "NOT_FOUND",
    message: "Not found",
  },
};

export function fromPostgrest(
  error: { code?: string; message: string; details?: string | null },
  fallbackMessage: string,
): ApiError {
  const mapped = error.code ? PG_CODE_MAP[error.code] : undefined;
  if (mapped) {
    return new ApiError(mapped.status, mapped.code, mapped.message);
  }
  return new ApiError(500, "DATABASE_ERROR", fallbackMessage,
    env.NODE_ENV === "development" ? error.message : undefined);
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: "ROUTE_NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "Request body failed validation",
        details: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }

  // Anything reaching here is a bug. Log it in full, tell the client nothing.
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
};
