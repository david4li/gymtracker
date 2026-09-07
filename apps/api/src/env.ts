import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Base project URL. Must not include /rest/v1 — supabase-js appends its own path,
  // and a URL that already carries it produces /rest/v1/rest/v1 and 404s everything.
  SUPABASE_URL: z
    .string()
    .url()
    .refine((u) => !u.includes("/rest/v1"), {
      message:
        "SUPABASE_URL must be the base project URL, without the /rest/v1 suffix",
    })
    .transform((u) => u.replace(/\/+$/, "")),

  // Publishable key only. The secret key must never be set here: this service relies on
  // row-level security via the caller's JWT, and a secret key carries bypassrls, which
  // would silently disable every policy in the database.
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),

  // Render injects PORT.
  PORT: z.coerce.number().int().positive().default(4000),

  // Comma-separated browser origins. Normally empty: the Next.js server calls this API
  // server-to-server, so no browser ever issues a cross-origin request to it.
  ALLOWED_ORIGINS: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment:\n" +
      parsed.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n"),
  );
  process.exit(1);
}

export const env = parsed.data;

// Fail loudly rather than serving traffic with RLS disabled.
if (/^sb_secret_|service_role/.test(env.SUPABASE_PUBLISHABLE_KEY)) {
  console.error(
    "SUPABASE_PUBLISHABLE_KEY looks like a secret/service_role key. " +
      "That bypasses row-level security and would expose every user's data. Refusing to start.",
  );
  process.exit(1);
}
