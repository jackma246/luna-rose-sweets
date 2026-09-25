// The server runs in UTC on Railway, developers run in Los Angeles, and nothing should depend on either:
// every date-sensitive function must give identical answers under any process time zone, and those
// answers must be the Los Angeles business-day ones.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { root } from "./helpers/loadTs.mjs";

const ZONES = ["UTC", "America/Los_Angeles", "Asia/Tokyo"];

function probe(tz) {
  const run = spawnSync(process.execPath, [path.join(root, "tests/helpers/tzProbe.mjs")], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, TZ: tz },
  });
  assert.equal(run.status, 0, `probe failed under TZ=${tz}:\n${run.stderr}`);
  return JSON.parse(run.stdout);
}

const results = Object.fromEntries(ZONES.map((tz) => [tz, probe(tz)]));

test("date logic gives identical results under UTC, America/Los_Angeles and Asia/Tokyo", () => {
  for (const tz of ZONES.slice(1)) assert.deepEqual(results[tz], results.UTC, `TZ=${tz} differs from TZ=UTC`);
});

test("between 5pm and midnight PT it is still the same business day", () => {
  const r = results.UTC;
  assert.equal(r.morningPT.todayKey, "2026-09-01");
  assert.equal(r.eveningPT.todayKey, "2026-09-01");
  assert.equal(r.lateEveningPT.todayKey, "2026-09-01");
  assert.equal(r.afterMidnightPT.todayKey, "2026-09-02");
  assert.equal(r.eveningPT.minRequestable, "2026-09-04");
  assert.equal(r.eveningPT.minRequestableCake, "2026-09-06");
  assert.equal(r.eveningPT.daysUntilSep5, 4);
  assert.equal(r.afterMidnightPT.daysUntilSep5, 3);
  assert.equal(r.eveningPT.remindersD0, "2026-09-01");
  assert.equal(r.eveningPT.remindersD3, "2026-09-04");
  assert.equal(r.static.businessDayOfEveningOrder, "2026-09-01");
});

test("report ranges follow the business calendar", () => {
  const r = results.UTC;
  assert.deepEqual(r.newYearsEvePT.thisMonth, { startKey: "2026-12-01", endKey: "2027-01-01" });
  assert.deepEqual(r.newYearsEvePT.lastMonth, { startKey: "2026-11-01", endKey: "2026-12-01" });
  assert.deepEqual(r.eveningPT.last30, { startKey: "2026-08-03", endKey: "2026-09-02" });
  assert.deepEqual(r.newYearsEvePT.monthOptions, ["2026-12=December 2026", "2026-11=November 2026"]);
  assert.equal(r.eveningPT.startOfDay, "2026-09-01T07:00:00.000Z");
  assert.equal(r.static.startOfBusinessDayWinter, "2026-12-31T08:00:00.000Z");
  assert.equal(r.static.startOfBusinessDaySpringForward, "2026-03-08T08:00:00.000Z");
  assert.deepEqual(r.static.parseMonth, ["2026-09-01T00:00:00.000Z", "2026-10-01T00:00:00.000Z"]);
});

test("calendar-day labels never shift a day", () => {
  const r = results.UTC;
  assert.equal(r.static.formatLongDate, "Saturday, September 5, 2026");
  assert.equal(r.static.formatDbDate, "Sat, Sep 5");
  assert.equal(r.static.inquiryEmailHasDate, true);
});
