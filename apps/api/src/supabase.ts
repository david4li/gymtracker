import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * A Supabase client that acts *as the calling user*.
 *
 * The publishable key identifies the project; the caller's JWT in the Authorization header
 * is what `auth.uid()` resolves to inside every row-level security policy. That is the whole
 * security model of this service: queries are scoped by the database, not by hand-written
 * `where user_id = ...` clauses that a developer can forget.
 *
 * Sessions are never persisted or refreshed here. Each request is stateless and carries its
 * own token, which the Next.js middleware has already refreshed upstream.
 */
export function userClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
