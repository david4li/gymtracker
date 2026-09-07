import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @gymtracker/shared ships raw TypeScript rather than a built dist, so Next has to
  // compile it. Required for local dev and for the Vercel build, which uses this app
  // as its Root Directory but resolves the package from the workspace root.
  transpilePackages: ["@gymtracker/shared"],
};

export default nextConfig;
