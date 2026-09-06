import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULTS = { id: 1 as const, weightUnit: "lbs" as const, defaultRestSeconds: 90 };

export async function getSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return row ?? DEFAULTS;
}
