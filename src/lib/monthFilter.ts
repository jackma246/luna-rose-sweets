import { addMonthsToMonthKey, formatDateKey, isMonthKey, monthKeyOf, toDbDate, todayKey } from "@/lib/businessDate";

export interface MonthOption {
  value: string;
  label: string;
}

/** The current business month (Los Angeles) and the n-1 months before it, newest first. */
export function lastNMonthOptions(n: number, now = new Date()): MonthOption[] {
  const current = monthKeyOf(todayKey(now));
  const out: MonthOption[] = [];
  for (let i = 0; i < n; i++) {
    const value = addMonthsToMonthKey(current, -i);
    out.push({ value, label: formatDateKey(`${value}-01`, { month: "long", year: "numeric" }) });
  }
  return out;
}

/**
 * [start, end) bounds of a YYYY-MM month for filtering @db.Date columns (neededDate, expense date).
 * Those are stored as UTC midnight, so the bounds are UTC midnight too - never the server's local time.
 */
export function parseMonth(value: string | undefined | null): { start: Date; end: Date } | null {
  if (!value || value === "all" || !isMonthKey(value)) return null;
  return { start: toDbDate(`${value}-01`), end: toDbDate(`${addMonthsToMonthKey(value, 1)}-01`) };
}
