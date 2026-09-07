import type { SupabaseClient } from "@supabase/supabase-js";
import type { SettingsDto, SettingsInput } from "@gymtracker/shared";
import { fromPostgrest } from "../middleware/error.js";
import { toSettings } from "../mappers.js";

const COLUMNS = "weight_unit,default_rest_seconds,timezone";

const DEFAULTS: SettingsDto = {
  weightUnit: "lbs",
  defaultRestSeconds: 90,
  timezone: "UTC",
};

export async function getSettings(supabase: SupabaseClient): Promise<SettingsDto> {
  const { data, error } = await supabase
    .from("user_settings")
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load settings");
  // The signup trigger creates this row, but fall back rather than 500 if it is missing.
  return data ? toSettings(data as never) : DEFAULTS;
}

export async function updateSettings(
  supabase: SupabaseClient,
  userId: string,
  input: SettingsInput,
): Promise<SettingsDto> {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        weight_unit: input.weightUnit,
        default_rest_seconds: input.defaultRestSeconds,
      },
      { onConflict: "user_id" },
    )
    .select(COLUMNS)
    .single();

  if (error) throw fromPostgrest(error, "Failed to save settings");
  return toSettings(data as never);
}

/**
 * Deletes this user's training data. Scoped by RLS through the caller's client, so it can
 * only ever reach their own rows, and it never touches the global exercise catalog.
 */
export async function resetAllData(supabase: SupabaseClient, userId: string) {
  // Order matters only for the tables without cascade coverage; children of workouts and
  // routines are removed by their composite foreign keys.
  for (const table of [
    "body_stats",
    "weekly_split_days",
    "workout_sets",
    "workouts",
    "routine_exercises",
    "routines",
  ]) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) throw fromPostgrest(error, `Failed to clear ${table}`);
  }

  // Only the user's own exercises. `user_id is null` rows are the shared catalog.
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("user_id", userId);
  if (error) throw fromPostgrest(error, "Failed to clear custom exercises");
}
