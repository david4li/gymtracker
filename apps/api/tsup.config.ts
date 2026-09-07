import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  clean: true,
  sourcemap: true,
  // @gymtracker/shared ships raw TypeScript, so it must be bundled in rather than left as a
  // runtime import. Render installs production dependencies only and could not compile it.
  noExternal: [/^@gymtracker\/shared/],
});
