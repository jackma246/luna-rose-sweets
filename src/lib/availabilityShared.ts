import { addDaysToKey, formatDateKey, todayKey } from "@/lib/businessDate";

export type AvailabilityStatus = "available" | "limited" | "fully_booked" | "closed";

/** Customers cannot request orders for days with these statuses. */
export const BLOCKED_STATUSES = ["closed", "fully_booked"] as const;
export type BlockedStatus = (typeof BLOCKED_STATUSES)[number];

/** Default minimum notice, in days, between today (business zone) and the requested date. */
export const MIN_LEAD_DAYS = 3;

export function isBlockedStatus(status: string | null | undefined): status is BlockedStatus {
  return (BLOCKED_STATUSES as readonly string[]).includes(status ?? "");
}

/** Earliest date key a customer may request, given the lead time. Computed in the business zone. */
export function minRequestableDateKey(now: Date = new Date(), leadDays: number = MIN_LEAD_DAYS): string {
  return addDaysToKey(todayKey(now), leadDays);
}

/** "Saturday, September 5" */
export function formatFriendlyDateKey(key: string): string {
  return formatDateKey(key, { weekday: "long", month: "long", day: "numeric" });
}

export function leadTimeMessage(leadDays: number, earliestKey: string): string {
  return `We need at least ${leadDays} days notice${leadDays === MIN_LEAD_DAYS ? "" : " for this order"} - the earliest date we can take is ${formatFriendlyDateKey(earliestKey)}.`;
}
