/** Volume of a single set: weight × reps. Warm-up sets are excluded by callers. */
export function setVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Sums per-set volume, grouped by an arbitrary key (e.g. an ISO week string or a
 * muscle group). `keyOf` decides the bucket for each item; volumes for items
 * mapping to the same key are added together.
 */
export function sumVolumeByKey<T>(
  items: T[],
  keyOf: (item: T) => string,
  volumeOf: (item: T) => number,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    totals.set(key, (totals.get(key) ?? 0) + volumeOf(item));
  }
  return totals;
}
