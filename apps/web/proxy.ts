import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

// Next.js 16 renamed the `middleware` convention to `proxy`. Same behaviour, nodejs runtime.

const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          }
        },
      },
    },
  );

  // This is the only place the refresh token is exercised: Server Components cannot write
  // cookies, so without a refresh here an expiring session would never rotate.
  //
  // getUser() is a network round trip to Supabase Auth, and paying it on every navigation was
  // the largest fixed cost per page. getSession() reads the cookie locally, so the round trip
  // now happens only when the token is actually close to expiring.
  //
  // Skipping server-side validation here is safe because this check only gates *routing*.
  // Every request that reads real data goes through the Express API, which verifies the JWT
  // signature independently, so a forged cookie gets an app shell and 401s on all its data.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user ?? null;

  const REFRESH_WINDOW_SECONDS = 300;
  const expiresIn = session?.expires_at
    ? session.expires_at - Math.floor(Date.now() / 1000)
    : 0;

  if (session && expiresIn < REFRESH_WINDOW_SECONDS) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
