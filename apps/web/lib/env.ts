import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once at module load.
 *
 * Everything here is deliberately un-prefixed: none of it may reach the browser. `API_URL`
 * in particular must stay server-only, since the whole auth model depends on the browser
 * never calling the API directly.
 *
 * Missing values fail loudly. The previous silent fallback to localhost meant a deploy with
 * an unset API_URL would build fine, start fine, and then fail every request in a way that
 * looked like a network fault rather than a misconfiguration.
 */
const schema = z.object({
  SUPABASE_URL: z
    .string()
    .url("SUPABASE_URL must be a URL")
    .refine((u) => !u.includes("/rest/v1"), {
      message: "SUPABASE_URL must be the base project URL, without the /rest/v1 suffix",
    })
    .transform((u) => u.replace(/\/+$/, "")),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "SUPABASE_PUBLISHABLE_KEY is required"),
  API_URL: z.string().url("API_URL must be a URL").transform((u) => u.replace(/\/+$/, "")),
});

type Env = z.infer<typeof schema>;

let cached: Env | null = null;

function load(): Env {
  if (cached) return cached;

  const parsed = schema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    // Convenience only in development; production must be explicit.
    API_URL:
      process.env.API_URL ??
      (process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000"),
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment for @gymtracker/web:\n${details}\n\n` +
        `Set these in .env locally, or in the Vercel project settings when deployed. ` +
        `See apps/web/.env.example.`,
    );
  }

  // A secret key here would be a serious mistake: it carries bypassrls.
  if (/^sb_secret_|service_role/.test(parsed.data.SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY looks like a secret key. That bypasses row-level security. Refusing to start.",
    );
  }

  cached = parsed.data;
  return cached;
}

/**
 * Validated lazily, on first property access, rather than at import time.
 *
 * `next build` evaluates these modules while collecting page data, so validating eagerly made
 * the build itself require runtime configuration: a deploy with the variables not yet set
 * failed at build with "Failed to collect page data" rather than at request time with the
 * actual reason. Every read happens inside a request handler, so lazy validation still fails
 * fast in production, with the message pointing at the real problem.
 */
export const env: Env = new Proxy({} as Env, {
  get: (_target, prop: string) => load()[prop as keyof Env],
});
