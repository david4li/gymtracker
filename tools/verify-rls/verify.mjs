// Phase 2 verification: prove the schema, grants, and RLS policies behave as designed.
// Creates two throwaway users, exercises the isolation boundaries, then deletes them.

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const PUB = process.env.SUPABASE_PUBLISHABLE_KEY;

const admin = createClient(URL, SECRET, { auth: { persistSession: false } });

// Signing in on the admin client would overwrite its secret key with the user's JWT for all
// subsequent queries, silently subjecting "admin" calls to RLS. Sign in on a throwaway client.
const signIn = (email, password) =>
  createClient(URL, PUB, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).auth.signInWithPassword({ email, password });

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
};

const asUser = (token) =>
  createClient(URL, PUB, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

async function makeUser(tag) {
  const email = `rlstest+${tag}-${Date.now()}@example.com`;
  const password = `Test-${Math.random().toString(36).slice(2)}-9aZ!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${tag}: ${error.message}`);
  const { data: session, error: signInError } = await signIn(email, password);
  if (signInError) throw new Error(`signIn ${tag}: ${signInError.message}`);
  return { id: data.user.id, client: asUser(session.session.access_token) };
}

const created = [];
try {
  const A = await makeUser("a");
  const B = await makeUser("b");
  created.push(A.id, B.id);

  // The signup trigger should have created a settings row for each user.
  const { data: settingsA } = await A.client.from("user_settings").select("*");
  check(
    "handle_new_user trigger created user_settings",
    settingsA?.length === 1 && settingsA[0].weight_unit === "lbs",
    JSON.stringify(settingsA?.[0] ?? null),
  );

  // If the authenticated role lacks table grants this fails with 42501 before RLS applies.
  const { error: grantErr } = await A.client.from("routines").select("id").limit(1);
  check(
    "authenticated role has table grants",
    !grantErr,
    grantErr ? `${grantErr.code} ${grantErr.message}` : "",
  );

  // A global exercise, inserted with the secret key which bypasses RLS.
  const { data: globalEx, error: gErr } = await admin
    .from("exercises")
    .insert({
      user_id: null,
      name: "RLS Test Global Press",
      primary_muscle_group: "chest",
      equipment: "barbell",
    })
    .select("id")
    .single();
  if (gErr) throw new Error(`global exercise insert: ${gErr.message}`);

  const { data: bSeesGlobal } = await B.client
    .from("exercises")
    .select("id")
    .eq("id", globalEx.id);
  check("global exercise is readable by any user", bSeesGlobal?.length === 1);

  const { data: bDeleted } = await B.client
    .from("exercises")
    .delete()
    .eq("id", globalEx.id)
    .select("id");
  check("global exercise cannot be deleted by a user", (bDeleted ?? []).length === 0);

  // A's routine must be invisible and unwritable to B.
  const { data: routineA, error: rErr } = await A.client
    .from("routines")
    .insert({ user_id: A.id, name: "A private routine" })
    .select("id")
    .single();
  check("user can insert own routine", !rErr, rErr?.message ?? "");

  const { data: bReads } = await B.client.from("routines").select("id");
  check("user B cannot read user A's routines", (bReads ?? []).length === 0);

  const { data: bUpdates } = await B.client
    .from("routines")
    .update({ name: "hacked" })
    .eq("id", routineA.id)
    .select("id");
  check("user B cannot update user A's routine", (bUpdates ?? []).length === 0);

  // Writing a row owned by someone else must be rejected by the WITH CHECK clause.
  const { error: spoofErr } = await B.client
    .from("routines")
    .insert({ user_id: A.id, name: "spoofed" });
  check(
    "user B cannot insert a row owned by user A",
    Boolean(spoofErr),
    spoofErr?.code ?? "",
  );

  // At most one workout in progress per user, enforced by a partial unique index.
  const { error: w1 } = await A.client
    .from("workouts")
    .insert({ user_id: A.id, finished_at: null });
  const { error: w2 } = await A.client
    .from("workouts")
    .insert({ user_id: A.id, finished_at: null });
  check("first active workout inserts", !w1, w1?.message ?? "");
  check(
    "second active workout is rejected with 23505",
    w2?.code === "23505",
    w2?.code ?? "no error",
  );

  // Both users may hold an active workout simultaneously.
  const { error: w3 } = await B.client
    .from("workouts")
    .insert({ user_id: B.id, finished_at: null });
  check("a different user may still start a workout", !w3, w3?.message ?? "");

  await admin.from("exercises").delete().eq("id", globalEx.id);
} catch (err) {
  check("script completed", false, String(err));
} finally {
  for (const id of created) await admin.auth.admin.deleteUser(id);
  console.log(`\ncleaned up ${created.length} throwaway users`);
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
