import { db } from "@/lib/db";
import { bodyStats } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function listBodyStats() {
  return db.select().from(bodyStats).orderBy(desc(bodyStats.date));
}

export async function getBodyStatById(id: number) {
  const [row] = await db.select().from(bodyStats).where(eq(bodyStats.id, id));
  return row ?? null;
}
