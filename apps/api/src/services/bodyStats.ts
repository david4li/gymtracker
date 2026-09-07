import type { SupabaseClient } from "@supabase/supabase-js";
import type { BodyStatDto, BodyStatInput } from "@gymtracker/shared";
import { ApiError, fromPostgrest } from "../middleware/error.js";
import { toBodyStat } from "../mappers.js";

const COLUMNS = "id,date,weight_kg,measurements,photo_url,notes";

export async function listBodyStats(
  supabase: SupabaseClient,
): Promise<BodyStatDto[]> {
  const { data, error } = await supabase
    .from("body_stats")
    .select(COLUMNS)
    .order("date", { ascending: false });

  if (error) throw fromPostgrest(error, "Failed to list body stats");
  return (data ?? []).map((r) => toBodyStat(r as never));
}

export async function getBodyStat(
  supabase: SupabaseClient,
  id: number,
): Promise<BodyStatDto> {
  const { data, error } = await supabase
    .from("body_stats")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to load body stat");
  if (!data) throw ApiError.notFound("body stat");
  return toBodyStat(data as never);
}

// The API's weight contract is always kilograms; the web action converts from lbs, since it
// is the layer that knows the user's display unit.
const toRow = (input: BodyStatInput) => ({
  date: input.date,
  weight_kg: input.weightKg ?? null,
  measurements: input.measurements ?? null,
  photo_url: input.photoUrl ?? null,
  notes: input.notes ?? null,
});

export async function createBodyStat(
  supabase: SupabaseClient,
  userId: string,
  input: BodyStatInput,
): Promise<BodyStatDto> {
  const { data, error } = await supabase
    .from("body_stats")
    .insert({ user_id: userId, ...toRow(input) })
    .select(COLUMNS)
    .single();

  if (error) throw fromPostgrest(error, "Failed to create body stat");
  return toBodyStat(data as never);
}

export async function updateBodyStat(
  supabase: SupabaseClient,
  id: number,
  input: BodyStatInput,
): Promise<BodyStatDto> {
  const { data, error } = await supabase
    .from("body_stats")
    .update(toRow(input))
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw fromPostgrest(error, "Failed to update body stat");
  if (!data) throw ApiError.notFound("body stat");
  return toBodyStat(data as never);
}

export async function deleteBodyStat(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("body_stats").delete().eq("id", id);
  if (error) throw fromPostgrest(error, "Failed to delete body stat");
}
