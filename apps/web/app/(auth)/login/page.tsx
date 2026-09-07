import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return <AuthForm mode="signin" action={signIn} next={next} initialError={error} />;
}
