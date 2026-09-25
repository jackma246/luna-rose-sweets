import { prisma } from "@/lib/prisma";
import { dateKeyFromDbDate, isDateKey, toDbDate, todayKey } from "@/lib/businessDate";
import {
  formatFriendlyDateKey,
  leadTimeMessage,
  minRequestableDateKey,
  MIN_LEAD_DAYS,
  type AvailabilityStatus,
} from "@/lib/availabilityShared";

export * from "@/lib/availabilityShared";

/** Availability rows for [fromKey, toKey), keyed by YYYY-MM-DD. */
export async function getAvailabilityMap(
  fromKey: string,
  toKey: string,
): Promise<Record<string, { status: AvailabilityStatus; note: string | null }>> {
  if (!isDateKey(fromKey) || !isDateKey(toKey)) return {};
  const rows = await prisma.availabilityDate.findMany({
    where: { date: { gte: toDbDate(fromKey), lt: toDbDate(toKey) } },
    orderBy: { date: "asc" },
  });
  const map: Record<string, { status: AvailabilityStatus; note: string | null }> = {};
  for (const row of rows) {
    map[dateKeyFromDbDate(row.date)] = { status: row.status, note: row.note };
  }
  return map;
}

export async function getAvailabilityStatus(key: string): Promise<AvailabilityStatus | null> {
  if (!isDateKey(key)) return null;
  const row = await prisma.availabilityDate.findUnique({ where: { date: toDbDate(key) } });
  return row?.status ?? null;
}

export type DateCheck = { ok: true; status: AvailabilityStatus | null } | { ok: false; reason: string };

/**
 * Authoritative check used by the order request and inquiry APIs.
 * Rejects malformed dates, past dates, dates under the lead time, and blocked days.
 * "Today" is the business (Los Angeles) day, whatever zone the server runs in.
 */
export async function assertDateRequestable(
  key: string,
  { now = new Date(), leadDays = MIN_LEAD_DAYS }: { now?: Date; leadDays?: number } = {},
): Promise<DateCheck> {
  if (!isDateKey(key)) return { ok: false, reason: "Please enter a valid date." };

  if (key < todayKey(now)) return { ok: false, reason: "That date has already passed - please pick another day." };
  const min = minRequestableDateKey(now, leadDays);
  if (key < min) return { ok: false, reason: leadTimeMessage(leadDays, min) };

  const status = await getAvailabilityStatus(key);
  if (status === "closed") {
    return { ok: false, reason: `We're closed on ${formatFriendlyDateKey(key)} - please pick another day.` };
  }
  if (status === "fully_booked") {
    return { ok: false, reason: `${formatFriendlyDateKey(key)} is fully booked - please pick another day.` };
  }
  return { ok: true, status };
}
