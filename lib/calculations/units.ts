import type { WeightUnit } from "@/lib/db/schema";

const KG_PER_LB = 0.45359237;

export function kgToLbs(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbsToKg(lbs: number): number {
  return lbs * KG_PER_LB;
}

/** Body stats are always stored in kg; convert for display based on the user's unit setting. */
export function displayBodyWeight(weightKg: number, unit: WeightUnit): number {
  return unit === "kg" ? weightKg : kgToLbs(weightKg);
}

export function formatWeight(value: number, unit: WeightUnit): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}
