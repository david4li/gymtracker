"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routineInputSchema, type RoutineInput } from "@gymtracker/shared";
import type { RoutineDetailDto } from "@gymtracker/shared";
import { api } from "@/lib/api/fetcher";

// RoutineInput now comes from @gymtracker/shared rather than being defined here, so the
// Express validator and this action check against one schema instead of two that can drift.
export type { RoutineInput };

export async function createRoutine(input: RoutineInput) {
  const data = routineInputSchema.parse(input);
  // The API call is deliberately outside any try/catch: redirect() throws a control-flow
  // signal that must not be swallowed, and a real failure should propagate to the form.
  const created = await api.post<RoutineDetailDto>("/routines", data);
  revalidatePath("/routines");
  redirect(`/routines/${created.id}`);
}

export async function updateRoutine(id: number, input: RoutineInput) {
  const data = routineInputSchema.parse(input);
  await api.put(`/routines/${id}`, data);
  revalidatePath("/routines");
  revalidatePath(`/routines/${id}`);
  redirect(`/routines/${id}`);
}

export async function deleteRoutine(id: number) {
  await api.del(`/routines/${id}`);
  revalidatePath("/routines");
  redirect("/routines");
}
