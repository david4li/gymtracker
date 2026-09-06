"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bodyStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { lbsToKg } from "@/lib/calculations/units";
import type { WeightUnit } from "@/lib/db/schema";

const bodyStatSchema = z.object({
  date: z.string().min(1),
  weight: z.coerce.number().min(0).max(2000).optional(),
  waist: z.coerce.number().min(0).max(500).optional(),
  chest: z.coerce.number().min(0).max(500).optional(),
  arms: z.coerce.number().min(0).max(500).optional(),
  hips: z.coerce.number().min(0).max(500).optional(),
  thighs: z.coerce.number().min(0).max(500).optional(),
  photoUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

function parseFormData(formData: FormData) {
  return bodyStatSchema.parse({
    date: formData.get("date"),
    weight: formData.get("weight") || undefined,
    waist: formData.get("waist") || undefined,
    chest: formData.get("chest") || undefined,
    arms: formData.get("arms") || undefined,
    hips: formData.get("hips") || undefined,
    thighs: formData.get("thighs") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

function buildMeasurements(data: ReturnType<typeof bodyStatSchema.parse>) {
  const measurements: Record<string, number> = {};
  for (const key of ["waist", "chest", "arms", "hips", "thighs"] as const) {
    if (data[key] !== undefined) measurements[key] = data[key]!;
  }
  return Object.keys(measurements).length ? measurements : null;
}

export async function createBodyStat(unit: WeightUnit, formData: FormData) {
  const data = parseFormData(formData);
  const weightKg = data.weight === undefined ? null : unit === "kg" ? data.weight : lbsToKg(data.weight);
  await db.insert(bodyStats).values({
    date: new Date(data.date),
    weightKg,
    measurements: buildMeasurements(data),
    photoUrl: data.photoUrl || null,
    notes: data.notes || null,
  });
  revalidatePath("/body-stats");
  redirect("/body-stats");
}

export async function updateBodyStat(id: number, unit: WeightUnit, formData: FormData) {
  const data = parseFormData(formData);
  const weightKg = data.weight === undefined ? null : unit === "kg" ? data.weight : lbsToKg(data.weight);
  await db
    .update(bodyStats)
    .set({
      date: new Date(data.date),
      weightKg,
      measurements: buildMeasurements(data),
      photoUrl: data.photoUrl || null,
      notes: data.notes || null,
    })
    .where(eq(bodyStats.id, id));
  revalidatePath("/body-stats");
  redirect("/body-stats");
}

export async function deleteBodyStat(id: number) {
  await db.delete(bodyStats).where(eq(bodyStats.id, id));
  revalidatePath("/body-stats");
  redirect("/body-stats");
}
