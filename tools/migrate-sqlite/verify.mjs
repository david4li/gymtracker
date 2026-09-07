// Proves the SQLite data survived the move to Supabase.
//
//   node --env-file-if-exists=.env verify.mjs --email you@example.com
//
// The volume checksum is the load-bearing assertion. A single number catches dropped rows,
// unit slips, and inverted booleans at once, which per-table row counts alone would not.

import { createClient } from "@supabase/supabase-js";
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const EMAIL = value("email");
const here = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = value("db") ?? path.join(here, "fixtures/sqlite.db");

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});
const sqlite = new Database(DB_PATH, { readonly: true });

const results = [];
const check = (name, pass, detail = "") => {
  results.push(pass);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
};

const one = (sql) => Object.values(sqlite.prepare(sql).get())[0];

const count = async (table, uid) => {
  let q = admin.from(table).select("*", { count: "exact", head: true });
  // Global exercises have no owner, so exercises are counted in full rather than by user.
  if (table !== "exercises") q = q.eq("user_id", uid);
  const { count: n, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return n ?? 0;
};

const main = async () => {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error(error.message);
  const user = data.users.find((u) => u.email?.toLowerCase() === EMAIL?.toLowerCase());
  if (!user) throw new Error(`No account for ${EMAIL}`);
  const uid = user.id;

  for (const table of [
    "exercises",
    "routines",
    "routine_exercises",
    "workouts",
    "workout_sets",
    "body_stats",
    "weekly_split_days",
  ]) {
    const expected = one(`select count(*) from ${table}`);
    const actual = await count(table, uid);
    check(`${table} row count`, expected === actual, `expected ${expected}, got ${actual}`);
  }

  // The checksum. Every non-warmup set's weight times reps, summed.
  const expectedVolume = one(
    "select sum(weight*reps) from workout_sets where is_warmup = 0",
  );
  const expectedRows = one("select count(*) from workout_sets where is_warmup = 0");

  const { data: sets, error: setsError } = await admin
    .from("workout_sets")
    .select("weight,reps")
    .eq("user_id", uid)
    .eq("is_warmup", false);
  if (setsError) throw new Error(setsError.message);

  const actualVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  check(
    "non-warmup volume checksum",
    Math.abs(expectedVolume - actualVolume) < 0.001,
    `expected ${expectedVolume}, got ${actualVolume}`,
  );
  check(
    "non-warmup set count",
    expectedRows === sets.length,
    `expected ${expectedRows}, got ${sets.length}`,
  );

  // Timestamps: catches the epoch seconds vs milliseconds trap, which silently yields 1970.
  const expectedMin = new Date(one("select min(date) from workouts") * 1000).toISOString();
  const expectedMax = new Date(one("select max(date) from workouts") * 1000).toISOString();
  const { data: bounds } = await admin
    .from("workouts")
    .select("date")
    .eq("user_id", uid)
    .order("date", { ascending: true });
  const actualMin = new Date(bounds[0].date).toISOString();
  const actualMax = new Date(bounds[bounds.length - 1].date).toISOString();
  check("earliest workout date", expectedMin === actualMin, `${expectedMin} vs ${actualMin}`);
  check("latest workout date", expectedMax === actualMax, `${expectedMax} vs ${actualMax}`);

  // PR flags: a mismatch means the boolean conversion or the insert ordering broke.
  const expectedPrs = one("select count(*) from workout_sets where is_pr = 1");
  const { count: actualPrs } = await admin
    .from("workout_sets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("is_pr", true);
  check("PR set count", expectedPrs === actualPrs, `expected ${expectedPrs}, got ${actualPrs}`);

  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
};

main()
  .catch((err) => {
    console.error(`\nVerification failed: ${err.message}`);
    process.exit(1);
  })
  .finally(() => sqlite.close());
