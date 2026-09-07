"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { WEIGHT_UNITS } from "@gymtracker/shared";
import { api } from "@/lib/api/fetcher";

const settingsFormSchema = z.object({
  weightUnit: z.enum(WEIGHT_UNITS),
  defaultRestSeconds: z.coerce.number().int().min(0).max(1800),
});

export async function updateSettings(formData: FormData) {
  const data = settingsFormSchema.parse({
    weightUnit: formData.get("weightUnit"),
    defaultRestSeconds: formData.get("defaultRestSeconds"),
  });
  await api.put("/settings", data);
  revalidatePath("/settings");
  revalidatePath("/");
}

/**
 * Wipes this account's logged data. Scoped by row-level security on the server, so it can
 * only ever reach the caller's own rows and never touches the shared exercise catalog.
 */
export async function resetAllData() {
  await api.post("/settings/reset");
  revalidatePath("/");
}
