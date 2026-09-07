import { parseISO } from "date-fns";

/**
 * JSON has no date type, so every timestamp arrives as a string. Components call date-fns
 * `format()` and `startedAt.getTime()` on these, and a string reaching `.getTime()` throws at
 * runtime with no compile-time warning at the JSX prop site. So dates are revived here, at the
 * single boundary, rather than at each call site where one would eventually be forgotten.
 *
 * Real Date objects serialise across the Server Component boundary, so revived values can be
 * passed straight to client components as props, exactly as before.
 */
export const toDate = (value: string): Date => parseISO(value);

export const toDateOrNull = (value: string | null): Date | null =>
  value === null ? null : parseISO(value);

/**
 * A calendar day (YYYY-MM-DD) becomes local midnight, not UTC midnight.
 *
 * This is deliberate and fixes a pre-existing bug: body stat dates were stored as UTC midnight
 * and rendered with local-time formatting, so anyone west of Greenwich saw the previous day.
 */
export const toLocalDay = (value: string): Date => parseISO(value);

/** Maps the date-shaped keys of a row, leaving everything else untouched. */
export function reviveKeys<T extends Record<string, unknown>, K extends keyof T>(
  row: T,
  keys: readonly K[],
): T & { [P in K]: Date } {
  const out = { ...row } as Record<string, unknown>;
  for (const key of keys) {
    const value = out[key as string];
    if (typeof value === "string") out[key as string] = parseISO(value);
  }
  return out as T & { [P in K]: Date };
}
