-- Row-level security.
--
-- Two details that are easy to get wrong and expensive to miss:
--
--   * `(select auth.uid())` rather than bare `auth.uid()`. The subquery form is evaluated
--     once as an InitPlan instead of once per row, which matters on the workout_sets scans
--     that analytics performs.
--   * `to authenticated` rather than the default `to public`. The anon role then has no
--     policy at all and can read nothing, even if the API's auth middleware were bypassed.
--
-- Note that foreign key checks in Postgres bypass RLS. A user could reference another user's
-- private exercise_id and the constraint would accept it. The API must re-select referenced
-- exercise ids through the caller's RLS-scoped client before inserting; see
-- assertExercisesVisible() in apps/api.

alter table exercises          enable row level security;
alter table routines           enable row level security;
alter table routine_exercises  enable row level security;
alter table workouts           enable row level security;
alter table workout_sets       enable row level security;
alter table body_stats         enable row level security;
alter table weekly_split_days  enable row level security;
alter table user_settings      enable row level security;

-- ---------- Exercises: read global or own, write own only ----------

create policy exercises_select on exercises
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy exercises_insert on exercises
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy exercises_update on exercises
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy exercises_delete on exercises
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------- Everything else: own rows only ----------

create policy routines_all on routines
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy routine_exercises_all on routine_exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy workouts_all on workouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy workout_sets_all on workout_sets
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy body_stats_all on body_stats
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy weekly_split_days_all on weekly_split_days
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy user_settings_all on user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
