import type { SupabaseClient } from "@supabase/supabase-js";
import type { SetSplitDayInput, SplitDayDto } from "@gymtracker/shared";
import { fromPostgrest } from "../middleware/error.js";
import { toSplitDay } from "../mappers.js";

const COLUMNS = "day_of_week,label,routine_id,routines(name)";

/** Always returns all seven days, filling unassigned ones so the UI can render a full week. */
export async function getWeeklySplit(
  supabase: SupabaseClient,
): Promise<SplitDayDto[]> {
  const { data, error } = await supabase
    .from("weekly_split_days")
    .select(COLUMNS)
    .order("day_of_week", { ascending: true });

  if (error) throw fromPostgrest(error, "Failed to load weekly split");

  const assigned = new Map<number, SplitDayDto>();
  for (const row of data ?? []) {
    const day = toSplitDay(row as never);
    assigned.set(day.dayOfWeek, day);
  }

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    return (
      assigned.get(dayOfWeek) ?? {
        dayOfWeek,
        label: "",
        routineId: null,
        routineName: null,
      }
    );
  });
}

export async function setSplitDay(
  supabase: SupabaseClient,
  userId: string,
  dayOfWeek: number,
  input: SetSplitDayInput,
): Promise<SplitDayDto> {
  // A real upsert, enabled by the unique (user_id, day_of_week) constraint. The original
  // did a select-then-branch, which could race.
  const { error } = await supabase.from("weekly_split_days").upsert(
    {
      user_id: userId,
      day_of_week: dayOfWeek,
      label: input.label ?? null,
      routine_id: input.routineId,
    },
    { onConflict: "user_id,day_of_week" },
  );

  if (error) throw fromPostgrest(error, "Failed to save split day");

  const { data, error: readError } = await supabase
    .from("weekly_split_days")
    .select(COLUMNS)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (readError) throw fromPostgrest(readError, "Failed to load split day");
  return toSplitDay(data as never);
}
