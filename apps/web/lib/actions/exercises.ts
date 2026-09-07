"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@gymtracker/shared";
import type { ExerciseDto } from "@gymtracker/shared";
import { api } from "@/lib/api/fetcher";

const exerciseFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  primaryMuscleGroup: z.enum(MUSCLE_GROUPS),
  secondaryMuscleGroups: z.array(z.enum(MUSCLE_GROUPS)).default([]),
  equipment: z.enum(EQUIPMENT_TYPES),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
});

function parseFormData(formData: FormData) {
  const data = exerciseFormSchema.parse({
    name: formData.get("name"),
    primaryMuscleGroup: formData.get("primaryMuscleGroup"),
    secondaryMuscleGroups: formData.getAll("secondaryMuscleGroups"),
    equipment: formData.get("equipment"),
    notes: formData.get("notes") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
  });
  // "" is a form artefact; the API contract uses null for absent.
  return { ...data, notes: data.notes || null, videoUrl: data.videoUrl || null };
}

export async function createExercise(formData: FormData) {
  const created = await api.post<ExerciseDto>("/exercises", parseFormData(formData));
  revalidatePath("/exercises");
  redirect(`/exercises/${created.id}`);
}

export async function updateExercise(id: number, formData: FormData) {
  await api.patch(`/exercises/${id}`, parseFormData(formData));
  revalidatePath("/exercises");
  revalidatePath(`/exercises/${id}`);
  redirect(`/exercises/${id}`);
}

export async function deleteExercise(id: number) {
  // The API enforces both rules: an exercise with logged sets cannot be deleted, and a
  // built-in catalog entry cannot be deleted by a user. Surface its message rather than a
  // guess, so the user learns which rule they hit.
  await api.del(`/exercises/${id}`);
  revalidatePath("/exercises");
  redirect("/exercises");
}
