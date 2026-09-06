import { db } from "@/lib/db";
import { weeklySplitDays, routines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function getWeeklySplit() {
  const rows = await db
    .select({ dayOfWeek: weeklySplitDays.dayOfWeek, routineId: weeklySplitDays.routineId, routineName: routines.name })
    .from(weeklySplitDays)
    .leftJoin(routines, eq(weeklySplitDays.routineId, routines.id));

  const byDay = new Map(rows.map((r) => [r.dayOfWeek, r]));
  return DAY_LABELS.map((label, dayOfWeek) => ({
    dayOfWeek,
    label,
    routineId: byDay.get(dayOfWeek)?.routineId ?? null,
    routineName: byDay.get(dayOfWeek)?.routineName ?? null,
  }));
}
