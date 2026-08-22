import { prisma } from "@/lib/prisma";
import {
  formatFriendlyDate,
  minRequestableDate,
  parseIsoDate,
  startOfToday,
  MIN_LEAD_DAYS,
  type AvailabilityStatus,
} from "@/lib/availabilityShared";

export * from "@/lib/availabilityShared";

export async function getAvailabilityMap(
  fromISO: string,
  toISO: string,
): Promise<Record<string, { status: AvailabilityStatus; note: string | null }>> {
  const from = parseIsoDate(fromISO);
  const to = parseIsoDate(toISO);
  if (!from || !to) return {};
  const rows = await prisma.availabilityDate.findMany({
    where: { date: { gte: from, lt: to } },
    orderBy: { date: "asc" },
  });
  const map: Record<string, { status: AvailabilityStatus; note: string | null }> = {};
  for (const row of rows) {
    map[row.date.toISOString().slice(0, 10)] = { status: row.status, note: row.note };
  }
  return map;
}

export async function getAvailabilityStatus(iso: string): Promise<AvailabilityStatus | null> {
  const d = parseIsoDate(iso);
  if (!d) return null;
  const row = await prisma.availabilityDate.findUnique({ where: { date: d } });
  return row?.status ?? null;
}

export type DateCheck = { ok: true; status: AvailabilityStatus | null } | { ok: false; reason: string };

/**
 * Authoritative check used by the order request API.
 * Rejects malformed dates, past dates, dates under the lead time, and blocked days.
 */
export async function assertDateRequestable(iso: string, now: Date = new Date()): Promise<DateCheck> {
  const d = parseIsoDate(iso);
  if (!d) return { ok: false, reason: "Please enter a valid date." };

  const min = minRequestableDate(now);
  if (d < startOfToday(now)) return { ok: false, reason: "That date has already passed - please pick another day." };
  if (d < min) {
    return {
      ok: false,
      reason: `We need at least ${MIN_LEAD_DAYS} days notice - the earliest date we can take is ${formatFriendlyDate(min)}.`,
    };
  }

  const status = await getAvailabilityStatus(iso);
  if (status === "closed") {
    return { ok: false, reason: `We're closed on ${formatFriendlyDate(d)} - please pick another day.` };
  }
  if (status === "fully_booked") {
    return { ok: false, reason: `${formatFriendlyDate(d)} is fully booked - please pick another day.` };
  }
  return { ok: true, status };
}
