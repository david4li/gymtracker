import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @gymtracker/shared ships raw TypeScript rather than a built dist, so Next has to
  // compile it. Required for local dev and for the Vercel build, which uses this app
  // as its Root Directory but resolves the package from the workspace root.
  transpilePackages: ["@gymtracker/shared"],

  // Point file tracing at the monorepo root. Without this Next infers the root from this
  // app's directory and can leave workspace dependencies out of the serverless bundle,
  // which shows up as a module-not-found at request time rather than a build failure.
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
};

export default nextConfig;
