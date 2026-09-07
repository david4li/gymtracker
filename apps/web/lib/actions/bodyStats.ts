"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { lbsToKg } from "@gymtracker/shared/calculations/units";
import type { BodyStatInput, WeightUnit } from "@gymtracker/shared";
import { api } from "@/lib/api/fetcher";

// Form parsing stays here: FormData arrives as strings and "" means absent, neither of which
// belongs in the API's JSON contract.
const bodyStatFormSchema = z.object({
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
  return bodyStatFormSchema.parse({
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

function buildMeasurements(data: ReturnType<typeof bodyStatFormSchema.parse>) {
  const measurements: Record<string, number> = {};
  for (const key of ["waist", "chest", "arms", "hips", "thighs"] as const) {
    if (data[key] !== undefined) measurements[key] = data[key]!;
  }
  return Object.keys(measurements).length ? measurements : null;
}

/**
 * The API's weight contract is kilograms. Converting here, not there, keeps the wire format
 * unambiguous: this is the only layer that knows which unit the user types in.
 */
function toInput(
  data: ReturnType<typeof bodyStatFormSchema.parse>,
  unit: WeightUnit,
): BodyStatInput {
  return {
    // The date input already produces YYYY-MM-DD, which is exactly the column's shape.
    date: data.date,
    weightKg:
      data.weight === undefined
        ? null
        : unit === "kg"
          ? data.weight
          : lbsToKg(data.weight),
    measurements: buildMeasurements(data),
    photoUrl: data.photoUrl || null,
    notes: data.notes || null,
  };
}

export async function createBodyStat(unit: WeightUnit, formData: FormData) {
  await api.post("/body-stats", toInput(parseFormData(formData), unit));
  revalidatePath("/body-stats");
  redirect("/body-stats");
}

export async function updateBodyStat(id: number, unit: WeightUnit, formData: FormData) {
  await api.patch(`/body-stats/${id}`, toInput(parseFormData(formData), unit));
  revalidatePath("/body-stats");
  redirect("/body-stats");
}

export async function deleteBodyStat(id: number) {
  await api.del(`/body-stats/${id}`);
  revalidatePath("/body-stats");
  redirect("/body-stats");
}
