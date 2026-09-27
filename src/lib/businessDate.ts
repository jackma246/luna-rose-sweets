/**
 * Business calendar helpers.
 *
 * Dip & Sprinkle operates in San Jose, so "today", lead times, reminder windows and report ranges are all
 * defined in America/Los_Angeles - never in the server's or the browser's local zone. Railway runs in UTC,
 * where the date flips at 5pm PT, and customers may browse from anywhere.
 *
 * Calendar days are passed around as "date keys" (YYYY-MM-DD strings). Postgres @db.Date columns come back
 * from Prisma as UTC-midnight Date objects, so they are converted with dateKeyFromDbDate / toDbDate and
 * formatted with timeZone "UTC". Real instants (createdAt, updatedAt) are formatted in the business zone.
 *
 * This module is pure (no Node or DB imports) so client components can use it too.
 */

export const BUSINESS_TIME_ZONE = "America/Los_Angeles";

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY_RE = /^(\d{4})-(\d{2})$/;
const DAY_MS = 86_400_000;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function keyFromUtcDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zonedParts(instant: Date): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const out: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(instant)) {
    if (part.type !== "literal") out[part.type] = Number(part.value);
  }
  return { year: out.year, month: out.month, day: out.day, hour: out.hour, minute: out.minute, second: out.second };
}

/** True for a well-formed YYYY-MM-DD string that names a real calendar day. */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = DATE_KEY_RE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return keyFromUtcDate(d) === value;
}

/** The business-zone calendar day that contains `instant`. */
export function businessDateKey(instant: Date): string {
  const p = zonedParts(instant);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

/** Today's date in the business zone, as YYYY-MM-DD. */
export function todayKey(now: Date = new Date()): string {
  return businessDateKey(now);
}

/** Calendar arithmetic on date keys (DST-proof: done in UTC). */
export function addDaysToKey(key: string, days: number): string {
  const d = toDbDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return keyFromUtcDate(d);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetweenKeys(from: string, to: string): number {
  return Math.round((toDbDate(to).getTime() - toDbDate(from).getTime()) / DAY_MS);
}

/**
 * UTC-midnight Date for a date key - the representation Prisma uses for @db.Date columns.
 * Throws on malformed keys; validate user input with isDateKey / parseDateKey first.
 */
export function toDbDate(key: string): Date {
  if (!isDateKey(key)) throw new Error(`Invalid date key: ${key}`);
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Like toDbDate but returns null for malformed or impossible dates (for user input). */
export function parseDateKey(value: unknown): Date | null {
  return isDateKey(value) ? toDbDate(value) : null;
}

/** Date key of a value read from a @db.Date column. */
export function dateKeyFromDbDate(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

/** YYYY-MM of a date key. */
export function monthKeyOf(key: string): string {
  return key.slice(0, 7);
}

/** The YYYY-MM month key `months` months after (or before) `monthKey`. */
export function addMonthsToMonthKey(monthKey: string, months: number): string {
  const m = MONTH_KEY_RE.exec(monthKey);
  if (!m) throw new Error(`Invalid month key: ${monthKey}`);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1 + months, 1));
  return keyFromUtcDate(d).slice(0, 7);
}

export function isMonthKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = MONTH_KEY_RE.exec(value);
  return Boolean(m) && Number(m![2]) >= 1 && Number(m![2]) <= 12;
}

/**
 * The instant at which the business day `key` starts (midnight in Los Angeles), as a UTC Date.
 * Used to query timestamp columns (createdAt) by business day.
 */
export function startOfBusinessDay(key: string): Date {
  const utcMidnight = toDbDate(key).getTime();
  // LA is UTC-7 or UTC-8. Find the offset in effect at that local midnight, re-checking once for DST edges.
  let guess = utcMidnight + 8 * 3_600_000;
  for (let i = 0; i < 2; i += 1) {
    const p = zonedParts(new Date(guess));
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const offset = asUtc - guess; // local - utc
    guess = utcMidnight - offset;
  }
  return new Date(guess);
}

type DateStyle = Omit<Intl.DateTimeFormatOptions, "timeZone">;

/** Format a date key (a calendar day, no time zone of its own). */
export function formatDateKey(key: string, options: DateStyle): string {
  return toDbDate(key).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

/** Format a value read from a @db.Date column. Always UTC so the day never shifts. */
export function formatDbDate(date: Date, options: DateStyle): string {
  return new Date(date).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

/** Format a real instant (createdAt, updatedAt, ...) as the business zone sees it. */
export function formatInstant(instant: Date, options: DateStyle): string {
  return new Date(instant).toLocaleString("en-US", { ...options, timeZone: BUSINESS_TIME_ZONE });
}

/** Long label used in customer and support emails, e.g. "Saturday, September 5, 2026". */
export function formatLongDateKey(key: string): string {
  return formatDateKey(key, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

/** Day of week (0 = Sunday) of a date key. */
export function weekdayOfKey(key: string): number {
  return toDbDate(key).getUTCDay();
}
