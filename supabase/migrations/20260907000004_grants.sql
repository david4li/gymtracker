-- Table privileges.
--
-- Supabase's dashboard-created tables pick up grants from default privileges defined for the
-- `postgres` role. Tables created by the CLI's migration role do not, so without this every
-- request fails with 42501 "permission denied" *before* row-level security is ever consulted.
-- RLS restricts which rows a role may touch; it does not grant the underlying table access.
--
-- `anon` is deliberately granted nothing. Every policy in 20260907000002_rls.sql is scoped
-- `to authenticated`, so an unauthenticated request should fail at the privilege check.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on
  public.exercises,
  public.routines,
  public.routine_exercises,
  public.workouts,
  public.workout_sets,
  public.body_stats,
  public.weekly_split_days,
  public.user_settings
to authenticated;

grant all privileges on
  public.exercises,
  public.routines,
  public.routine_exercises,
  public.workouts,
  public.workout_sets,
  public.body_stats,
  public.weekly_split_days,
  public.user_settings
to service_role;

-- Identity columns draw from sequences; INSERT fails without usage on them.
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Apply the same shape to anything added by a later migration, so this is not a recurring trap.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
