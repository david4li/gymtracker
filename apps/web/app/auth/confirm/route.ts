import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing point for the emailed confirmation link.
 *
 * Supabase sends a token_hash plus a type; exchanging them here establishes the session and
 * sets the cookies, so the user arrives already signed in.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+confirmation+link", request.url),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=Confirmation+link+expired", request.url),
    );
  }

  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", request.url));
}
