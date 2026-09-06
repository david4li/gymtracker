"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settings, WEIGHT_UNITS } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { exercises, routines, workouts, bodyStats } from "@/lib/db/schema";

const settingsSchema = z.object({
  weightUnit: z.enum(WEIGHT_UNITS),
  defaultRestSeconds: z.coerce.number().int().min(0).max(1800),
});

export async function updateSettings(formData: FormData) {
  const data = settingsSchema.parse({
    weightUnit: formData.get("weightUnit"),
    defaultRestSeconds: formData.get("defaultRestSeconds"),
  });
  const [existing] = await db.select().from(settings).where(eq(settings.id, 1));
  if (existing) {
    await db.update(settings).set(data).where(eq(settings.id, 1));
  } else {
    await db.insert(settings).values({ id: 1, ...data });
  }
  revalidatePath("/settings");
  revalidatePath("/");
}

/** Dev convenience: wipe all logged data while keeping the exercise library, then let `npm run db:seed` repopulate sample data on next run. */
export async function resetAllData() {
  await db.delete(bodyStats);
  await db.delete(workouts);
  await db.delete(routines);
  await db.delete(exercises).where(eq(exercises.isCustom, true));
  revalidatePath("/");
}
