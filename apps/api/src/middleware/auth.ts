import type { RequestHandler } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "../env.js";
import { userClient } from "../supabase.js";
import { ApiError } from "./error.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** The authenticated caller. */
      user: { id: string; email: string | null };
      /** A Supabase client carrying the caller's JWT, so every query is RLS-scoped. */
      supabase: SupabaseClient;
    }
  }
}

/**
 * Supabase signs access tokens with ES256 and publishes the public key set. Verifying against
 * that locally removes a network round trip to Supabase Auth from *every* API request, which
 * was roughly half the latency of a typical call.
 *
 * `createRemoteJWKSet` fetches once and caches, re-fetching only when it sees an unknown key
 * id, so key rotation still works without a redeploy.
 */
const jwks = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
  { cacheMaxAge: 10 * 60 * 1000 },
);

type SupabaseJWT = JWTPayload & { sub: string; email?: string; role?: string };

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;

  if (!token) {
    next(new ApiError(401, "MISSING_TOKEN", "Authorization bearer token required"));
    return;
  }

  let payload: SupabaseJWT;
  try {
    // Checks the signature, `exp`, and that the issuer really is this project's auth server.
    const result = await jwtVerify(token, jwks, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
    });
    payload = result.payload as SupabaseJWT;
  } catch {
    next(new ApiError(401, "INVALID_TOKEN", "Session is invalid or expired"));
    return;
  }

  if (!payload.sub || payload.role === "anon") {
    next(new ApiError(401, "INVALID_TOKEN", "Session is invalid or expired"));
    return;
  }

  req.user = { id: payload.sub, email: payload.email ?? null };
  // Still the user's own JWT, so auth.uid() resolves per request and RLS does the real work.
  // Local verification changes only *how* the token is checked, never what it grants.
  req.supabase = userClient(token);
  next();
};
