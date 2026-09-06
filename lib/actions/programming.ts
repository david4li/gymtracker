"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { weeklySplitDays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const setSplitDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  label: z.string().trim().max(60).optional(),
  routineId: z.number().int().positive().nullable(),
});

/** Upserts the single row for this day of week (0=Sun..6=Sat). */
export async function setSplitDay(input: z.input<typeof setSplitDaySchema>) {
  const data = setSplitDaySchema.parse(input);
  const [existing] = await db.select().from(weeklySplitDays).where(eq(weeklySplitDays.dayOfWeek, data.dayOfWeek));
  if (existing) {
    await db
      .update(weeklySplitDays)
      .set({ label: data.label || null, routineId: data.routineId })
      .where(eq(weeklySplitDays.id, existing.id));
  } else {
    await db.insert(weeklySplitDays).values({ dayOfWeek: data.dayOfWeek, label: data.label || null, routineId: data.routineId });
  }
  revalidatePath("/programming/split-builder");
  revalidatePath("/programming");
}
