import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * A Supabase client bound to the request's cookies.
 *
 * Session cookies are httpOnly. That is possible only because no browser code ever needs to
 * read the session: the frontend calls the Express API from the server, never from the client,
 * so `@supabase/supabase-js` never enters the client bundle and a stolen XSS payload has no
 * token to steal.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
              });
            }
          } catch {
            // Server Components cannot write cookies. The proxy refreshes the session on
            // every request, so ignoring this is safe.
          }
        },
      },
    },
  );
}
