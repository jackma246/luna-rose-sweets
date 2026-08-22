import { NextRequest, NextResponse } from "next/server";
import { dateKey, getAvailabilityMap, parseIsoDate, startOfToday } from "@/lib/availability";

export const dynamic = "force-dynamic";

const MAX_MONTHS_AHEAD = 18;

/**
 * Public, read-only availability feed for the customer-facing date picker.
 * Only exposes date + status for non-available days. Notes and ids stay internal.
 */
export async function GET(req: NextRequest) {
  const today = startOfToday();
  const fromParam = req.nextUrl.searchParams.get("from");
  const toParam = req.nextUrl.searchParams.get("to");

  const from = (fromParam && parseIsoDate(fromParam)) || today;
  const defaultTo = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const maxTo = new Date(today.getFullYear(), today.getMonth() + MAX_MONTHS_AHEAD, 1);
  let to = (toParam && parseIsoDate(toParam)) || defaultTo;
  if (to > maxTo) to = maxTo;

  const map = await getAvailabilityMap(dateKey(from), dateKey(to));
  const dates = Object.entries(map)
    .filter(([, v]) => v.status !== "available")
    .map(([date, v]) => ({ date, status: v.status }));

  return NextResponse.json({ ok: true, dates }, { headers: { "Cache-Control": "no-store" } });
}
