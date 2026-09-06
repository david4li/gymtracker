"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exercises, MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isExerciseReferenced } from "@/lib/queries/exercises";

const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  primaryMuscleGroup: z.enum(MUSCLE_GROUPS),
  secondaryMuscleGroups: z.array(z.enum(MUSCLE_GROUPS)).default([]),
  equipment: z.enum(EQUIPMENT_TYPES),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
});

function parseFormData(formData: FormData) {
  return exerciseSchema.parse({
    name: formData.get("name"),
    primaryMuscleGroup: formData.get("primaryMuscleGroup"),
    secondaryMuscleGroups: formData.getAll("secondaryMuscleGroups"),
    equipment: formData.get("equipment"),
    notes: formData.get("notes") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
  });
}

export async function createExercise(formData: FormData) {
  const data = parseFormData(formData);
  const [row] = await db
    .insert(exercises)
    .values({ ...data, notes: data.notes || null, videoUrl: data.videoUrl || null, isCustom: true })
    .returning();
  revalidatePath("/exercises");
  redirect(`/exercises/${row.id}`);
}

export async function updateExercise(id: number, formData: FormData) {
  const data = parseFormData(formData);
  await db
    .update(exercises)
    .set({ ...data, notes: data.notes || null, videoUrl: data.videoUrl || null })
    .where(eq(exercises.id, id));
  revalidatePath("/exercises");
  revalidatePath(`/exercises/${id}`);
  redirect(`/exercises/${id}`);
}

export async function deleteExercise(id: number) {
  const referenced = await isExerciseReferenced(id);
  if (referenced) {
    throw new Error("Can't delete an exercise that has logged sets. Remove those sets first, or just stop using it going forward.");
  }
  await db.delete(exercises).where(eq(exercises.id, id));
  revalidatePath("/exercises");
  redirect("/exercises");
}
