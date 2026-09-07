import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type { ApiErrorBody } from "@gymtracker/shared";

/** Deadline for a single API call. Generous enough for a cold start, short enough to fail. */
const REQUEST_TIMEOUT_MS = 20_000;

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
}

/**
 * The single door between the frontend and the API.
 *
 * Two things here are load-bearing:
 *
 *   * `cache: "no-store"` is hardcoded and cannot be overridden by callers. Two different
 *     users produce byte-identical request URLs, so any caching of these responses would
 *     serve one user's data to another. This is the most dangerous failure mode in the whole
 *     architecture, and the reason no bare fetch() should exist anywhere in this app.
 *   * The bearer token comes from httpOnly cookies via the server client, so the browser
 *     never holds a JWT.
 *
 * `getSession()` rather than `getUser()`: the proxy already validated and refreshed this
 * request's session, and Express verifies the token independently one hop later, so a forged
 * cookie is caught regardless. `getUser()` here would add a network round trip per call.
 */
/**
 * The access token for the current render, resolved once.
 *
 * A page like the dashboard issues six API calls in parallel. Without this, each one built its
 * own Supabase client and called getSession(), and gotrue serialises concurrent auth calls
 * behind a lock, so those six turned into a queue and dominated the page's render time.
 * React's cache() scopes memoisation to a single request, so there is no cross-user leakage.
 */
const getAccessToken = cache(async (): Promise<string | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();

  if (!accessToken) redirect("/login");

  // Without a deadline a single unresponsive request hangs the whole render, and on a host
  // that sleeps when idle (Render's free tier) the first request after a spin-down can stall
  // for a long time. Fail with something actionable instead of hanging indefinitely.
  let response: Response;
  try {
    response = await fetch(`${env.API_URL}/api/v1${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "content-type": "application/json",
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (cause) {
    if (cause instanceof Error && cause.name === "TimeoutError") {
      throw new ApiError(
        504,
        "API_TIMEOUT",
        `The API did not respond within ${REQUEST_TIMEOUT_MS / 1000}s (${env.API_URL}). ` +
          `If it is hosted on a plan that sleeps when idle, the first request after a ` +
          `spin-down can exceed this.`,
      );
    }
    throw new ApiError(
      502,
      "API_UNREACHABLE",
      `Could not reach the API at ${env.API_URL}.`,
      cause instanceof Error ? cause.message : undefined,
    );
  }

  if (response.status === 401) redirect("/login");

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Non-JSON error body; fall through to a generic message.
    }
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `Request failed with ${response.status}`,
      body?.error?.details,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: (path: string) => apiFetch<void>(path, { method: "DELETE" }),
};

/** Builds a query string, dropping empty and undefined values. */
export function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}
