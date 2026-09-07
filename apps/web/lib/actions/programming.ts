"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/fetcher";

const setSplitDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  label: z.string().trim().max(60).optional(),
  routineId: z.number().int().positive().nullable(),
});

export async function setSplitDay(input: z.input<typeof setSplitDaySchema>) {
  const { dayOfWeek, ...body } = setSplitDaySchema.parse(input);
  await api.put(`/split/${dayOfWeek}`, body);
  revalidatePath("/programming/split-builder");
  revalidatePath("/programming");
}
