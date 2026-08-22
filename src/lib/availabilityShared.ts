export type AvailabilityStatus = "available" | "limited" | "fully_booked" | "closed";

/** Customers cannot request orders for days with these statuses. */
export const BLOCKED_STATUSES = ["closed", "fully_booked"] as const;
export type BlockedStatus = (typeof BLOCKED_STATUSES)[number];

/** Minimum notice, in days, between today and the requested date. */
export const MIN_LEAD_DAYS = 3;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isBlockedStatus(status: string | null | undefined): status is BlockedStatus {
  return (BLOCKED_STATUSES as readonly string[]).includes(status ?? "");
}

/** Local-time YYYY-MM-DD key (no UTC shift). */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Parse YYYY-MM-DD as a local midnight Date. Returns null if malformed or not a real calendar day. */
export function parseIsoDate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime()) || dateKey(d) !== iso) return null;
  return d;
}

export function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function minRequestableDate(now: Date = new Date()): Date {
  const t = startOfToday(now);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + MIN_LEAD_DAYS);
}

export function formatFriendlyDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
