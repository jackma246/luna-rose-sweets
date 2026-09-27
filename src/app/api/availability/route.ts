import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityMap } from "@/lib/availability";
import { addMonthsToMonthKey, isDateKey, monthKeyOf, todayKey } from "@/lib/businessDate";

export const dynamic = "force-dynamic";

const MAX_MONTHS_AHEAD = 18;

/**
 * Public, read-only availability feed for the customer-facing date picker.
 * Only exposes date + status for non-available days. Notes and ids stay internal.
 */
export async function GET(req: NextRequest) {
  const today = todayKey();
  const thisMonth = monthKeyOf(today);
  const fromParam = req.nextUrl.searchParams.get("from");
  const toParam = req.nextUrl.searchParams.get("to");

  const from = isDateKey(fromParam) ? fromParam : today;
  const defaultTo = `${addMonthsToMonthKey(thisMonth, 12)}-01`;
  const maxTo = `${addMonthsToMonthKey(thisMonth, MAX_MONTHS_AHEAD)}-01`;
  let to = isDateKey(toParam) ? toParam : defaultTo;
  if (to > maxTo) to = maxTo;

  const map = await getAvailabilityMap(from, to);
  const dates = Object.entries(map)
    .filter(([, v]) => v.status !== "available")
    .map(([date, v]) => ({ date, status: v.status }));

  return NextResponse.json({ ok: true, dates }, { headers: { "Cache-Control": "no-store" } });
}
