/**
 * Simplified plateau/deload heuristic — NOT a statistical model. It flags a
 * plateau when the best estimated-1RM across the most recent 3 sessions hasn't
 * exceeded the value from the 4th-most-recent session, given at least 4 sessions
 * of history. Good enough to surface a useful nudge; the UI labels it as a rough
 * heuristic rather than a guarantee.
 */
export type PlateauResult = {
  plateaued: boolean;
  suggestion: string | null;
};

export function detectPlateau(sessionBest1RMsOldestFirst: number[]): PlateauResult {
  const n = sessionBest1RMsOldestFirst.length;
  if (n < 4) {
    return { plateaued: false, suggestion: null };
  }
  const baseline = sessionBest1RMsOldestFirst[n - 4];
  const recentBest = Math.max(...sessionBest1RMsOldestFirst.slice(n - 3));
  const plateaued = recentBest <= baseline;
  return {
    plateaued,
    suggestion: plateaued
      ? "No new estimated 1RM in your last 3 sessions vs. 4 sessions ago — consider a deload week (~10% less load) or a rep/rest change before pushing further."
      : null,
  };
}
