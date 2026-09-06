"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { routines, routineExercises, GROUP_TYPES } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const routineExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  order: z.number().int().min(0),
  targetSets: z.number().int().min(1).max(20),
  targetRepsMin: z.number().int().min(1).max(100),
  targetRepsMax: z.number().int().min(1).max(100),
  targetRpe: z.number().min(1).max(10).optional(),
  restSeconds: z.number().int().min(0).max(1800),
  groupId: z.string().optional(),
  groupType: z.enum(GROUP_TYPES).optional(),
});

const routineSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(1000).optional(),
  exercises: z.array(routineExerciseSchema).min(1, "Add at least one exercise"),
});
export type RoutineInput = z.input<typeof routineSchema>;

export async function createRoutine(input: RoutineInput) {
  const data = routineSchema.parse(input);
  const routineId = await db.transaction(async (tx) => {
    const [row] = await tx.insert(routines).values({ name: data.name, description: data.description || null }).returning();
    for (const ex of data.exercises) {
      await tx.insert(routineExercises).values({ ...ex, routineId: row.id });
    }
    return row.id;
  });
  revalidatePath("/routines");
  redirect(`/routines/${routineId}`);
}

export async function updateRoutine(id: number, input: RoutineInput) {
  const data = routineSchema.parse(input);
  await db.transaction(async (tx) => {
    await tx.update(routines).set({ name: data.name, description: data.description || null, updatedAt: new Date() }).where(eq(routines.id, id));
    await tx.delete(routineExercises).where(eq(routineExercises.routineId, id));
    for (const ex of data.exercises) {
      await tx.insert(routineExercises).values({ ...ex, routineId: id });
    }
  });
  revalidatePath("/routines");
  revalidatePath(`/routines/${id}`);
  redirect(`/routines/${id}`);
}

export async function deleteRoutine(id: number) {
  await db.delete(routines).where(eq(routines.id, id));
  revalidatePath("/routines");
  redirect("/routines");
}
