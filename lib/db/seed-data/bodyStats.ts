export type BodyStatSeed = {
  daysAgo: number;
  weightKg: number;
  measurements?: Record<string, number>;
  notes?: string;
};

/**
 * Sample body-stat entries, dated relative to seed time. Measurements are stored
 * in centimeters for consistency; weight is stored in kg internally regardless of
 * the display unit (see lib/calculations/units.ts for conversion).
 */
export const bodyStatSeedData: BodyStatSeed[] = [
  { daysAgo: 18, weightKg: 82.1, measurements: { waist: 86, chest: 104, arms: 38 }, notes: "Starting point for this training block." },
  { daysAgo: 11, weightKg: 81.8, measurements: { waist: 85.5, chest: 104, arms: 38.2 } },
  { daysAgo: 4, weightKg: 81.5, measurements: { waist: 85, chest: 104.5, arms: 38.5 }, notes: "Feeling leaner, strength trending up too." },
];
