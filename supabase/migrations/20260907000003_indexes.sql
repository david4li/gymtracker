-- Indexes.
--
-- Every RLS policy filters on user_id, so the user_id-leading indexes below serve both the
-- policy check and the query itself.

create index routine_exercises_routine_idx on routine_exercises (routine_id, sort_order);
create index routine_exercises_user_idx    on routine_exercises (user_id);

create index workout_sets_workout_idx  on workout_sets (workout_id);
create index workout_sets_exercise_idx on workout_sets (exercise_id, is_warmup);
create index workout_sets_user_idx     on workout_sets (user_id);

-- Serves both getActiveWorkout (finished_at is null) and the history list (date desc).
create index workouts_user_state_idx on workouts (user_id, finished_at, date desc);

create index body_stats_user_date_idx on body_stats (user_id, date desc);

create index exercises_user_idx   on exercises (user_id);
create index exercises_muscle_idx on exercises (primary_muscle_group);

-- The exercise library search is a substring match, which a btree index cannot serve.
-- Trigram indexing makes `name ilike '%press%'` an index scan instead of a full table scan.
create index exercises_name_trgm_idx on exercises using gin (name gin_trgm_ops);
