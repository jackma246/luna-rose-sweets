// Child process for tests/timezones.test.mjs: evaluates the date-sensitive functions for fixed instants
// under whatever TZ this process was started with, and prints the results as JSON.
import { loadTsModule } from "./loadTs.mjs";

const prismaMock = { "@/lib/prisma": { prisma: {} } };
const cache = new Map();
const load = (file) => loadTsModule(file, prismaMock, cache);

const bd = load("src/lib/businessDate.ts");
const shared = load("src/lib/availabilityShared.ts");
const status = load("src/lib/orderStatus.ts");
const ranges = load("src/lib/reportRanges.ts");
const months = load("src/lib/monthFilter.ts");
const emails = load("src/lib/orderEmails.ts");
const inquiryEmails = load("src/lib/inquiryEmails.ts");
const reminders = load("src/app/api/cron/reminders/route.ts");

// Instants chosen around the 5pm-midnight PT window where UTC is already "tomorrow".
const instants = {
  morningPT: "2026-09-01T17:00:00Z", // Tue Sep 1, 10:00 PDT
  eveningPT: "2026-09-02T01:00:00Z", // Tue Sep 1, 18:00 PDT (Wed in UTC and Tokyo)
  lateEveningPT: "2026-09-02T06:59:00Z", // Tue Sep 1, 23:59 PDT
  afterMidnightPT: "2026-09-02T07:01:00Z", // Wed Sep 2, 00:01 PDT
  newYearsEvePT: "2027-01-01T05:30:00Z", // Thu Dec 31 2026, 21:30 PST
  dstStart: "2026-03-08T10:30:00Z", // Sun Mar 8, 03:30 PDT (just after the spring-forward gap)
};

const out = {};
for (const [name, iso] of Object.entries(instants)) {
  const now = new Date(iso);
  out[name] = {
    todayKey: bd.todayKey(now),
    minRequestable: shared.minRequestableDateKey(now),
    minRequestableCake: shared.minRequestableDateKey(now, 5),
    daysUntilSep5: status.daysUntil(new Date("2026-09-05T00:00:00Z"), now),
    remindersD0: reminders.windowDueDateKey(0, now),
    remindersD3: reminders.windowDueDateKey(3, now),
    thisMonth: ranges.rangeKeys("this_month", now),
    last30: ranges.rangeKeys("30d", now),
    lastMonth: ranges.rangeKeys("last_month", now),
    monthOptions: months.lastNMonthOptions(2, now).map((o) => `${o.value}=${o.label}`),
    startOfDay: bd.startOfBusinessDay(bd.todayKey(now)).toISOString(),
  };
}
out.static = {
  formatLongDate: emails.formatLongDate("2026-09-05"),
  formatDbDate: bd.formatDbDate(new Date("2026-09-05T00:00:00Z"), { weekday: "short", month: "short", day: "numeric" }),
  parseMonth: (() => {
    const r = months.parseMonth("2026-09");
    return [r.start.toISOString(), r.end.toISOString()];
  })(),
  inquiryEmailHasDate: inquiryEmails
    .inquirySupportEmail({
      name: "Sam",
      email: "sam@example.com",
      eventDate: new Date("2026-09-05T00:00:00Z"),
      source: "website_contact",
      createdAt: new Date("2026-09-02T01:00:00Z"),
    })
    .includes("Saturday, September 5, 2026"),
  businessDayOfEveningOrder: bd.businessDateKey(new Date("2026-09-02T01:00:00Z")),
  startOfBusinessDayWinter: bd.startOfBusinessDay("2026-12-31").toISOString(),
  startOfBusinessDaySpringForward: bd.startOfBusinessDay("2026-03-08").toISOString(),
};
process.stdout.write(JSON.stringify(out));
