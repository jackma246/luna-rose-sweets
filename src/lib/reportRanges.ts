import { addDaysToKey, addMonthsToMonthKey, formatDateKey, monthKeyOf, todayKey } from "@/lib/businessDate";

export type Range = "30d" | "this_month" | "last_month" | "ytd" | "12m";

/**
 * Report range as business-date keys [startKey, endKey) in Los Angeles. createdAt (a timestamp) is
 * queried from LA midnight to LA midnight; expense dates (@db.Date) by the same calendar days.
 */
export function rangeKeys(range: Range, now: Date = new Date()): { startKey: string; endKey: string } {
  const today = todayKey(now);
  const endKey = addDaysToKey(today, 1);
  const thisMonth = monthKeyOf(today);
  if (range === "30d") return { startKey: addDaysToKey(endKey, -30), endKey };
  if (range === "this_month") return { startKey: `${thisMonth}-01`, endKey };
  if (range === "last_month") return { startKey: `${addMonthsToMonthKey(thisMonth, -1)}-01`, endKey: `${thisMonth}-01` };
  if (range === "ytd") return { startKey: `${today.slice(0, 4)}-01-01`, endKey };
  return { startKey: `${addMonthsToMonthKey(thisMonth, -11)}-01`, endKey };
}

export function monthLabel(key: string): string {
  return formatDateKey(`${key}-01`, { month: "short", year: "2-digit" });
}

export function buildMonthlyBuckets(startKey: string, lastKey: string): string[] {
  const out: string[] = [];
  const last = monthKeyOf(lastKey);
  for (let m = monthKeyOf(startKey); m <= last; m = addMonthsToMonthKey(m, 1)) out.push(m);
  return out;
}
