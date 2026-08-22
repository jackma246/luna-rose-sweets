import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { availabilityDate: { findUnique, findMany: vi.fn() } } }));

import { assertDateRequestable, isBlockedStatus, minRequestableDate, parseIsoDate, dateKey } from "@/lib/availability";

// Fixed "now": Tuesday 2026-09-01 10:00 local
const NOW = new Date(2026, 8, 1, 10, 0, 0);

function statusFor(status: string | null) {
  findUnique.mockResolvedValue(status ? { status } : null);
}

beforeEach(() => findUnique.mockReset());

describe("isBlockedStatus", () => {
  it("blocks closed and fully_booked only", () => {
    expect(isBlockedStatus("closed")).toBe(true);
    expect(isBlockedStatus("fully_booked")).toBe(true);
    expect(isBlockedStatus("limited")).toBe(false);
    expect(isBlockedStatus("available")).toBe(false);
    expect(isBlockedStatus(null)).toBe(false);
    expect(isBlockedStatus(undefined)).toBe(false);
  });
});

describe("date helpers", () => {
  it("parseIsoDate rejects malformed and impossible dates", () => {
    expect(parseIsoDate("2026-9-1")).toBeNull();
    expect(parseIsoDate("not a date")).toBeNull();
    expect(parseIsoDate("2026-02-30")).toBeNull();
    expect(parseIsoDate("2026-09-05")?.getDate()).toBe(5);
  });
  it("minRequestableDate is today + 3 in local time", () => {
    expect(dateKey(minRequestableDate(NOW))).toBe("2026-09-04");
  });
});

describe("assertDateRequestable", () => {
  it("rejects bad format without touching the DB", async () => {
    const r = await assertDateRequestable("09/05/2026", NOW);
    expect(r.ok).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });
  it("rejects past dates", async () => {
    const r = await assertDateRequestable("2026-08-30", NOW);
    expect(r).toMatchObject({ ok: false });
    expect(findUnique).not.toHaveBeenCalled();
  });
  it("rejects dates under the 3 day lead time", async () => {
    const r = await assertDateRequestable("2026-09-03", NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/3 days notice/);
  });
  it("rejects closed days with a customer-facing reason", async () => {
    statusFor("closed");
    const r = await assertDateRequestable("2026-09-05", NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/closed on Saturday, September 5/);
  });
  it("rejects fully booked days", async () => {
    statusFor("fully_booked");
    const r = await assertDateRequestable("2026-09-05", NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/fully booked/);
  });
  it("allows limited days", async () => {
    statusFor("limited");
    expect(await assertDateRequestable("2026-09-05", NOW)).toEqual({ ok: true, status: "limited" });
  });
  it("allows available and unmarked days", async () => {
    statusFor("available");
    expect(await assertDateRequestable("2026-09-05", NOW)).toEqual({ ok: true, status: "available" });
    statusFor(null);
    expect(await assertDateRequestable("2026-09-06", NOW)).toEqual({ ok: true, status: null });
  });
  it("allows exactly the minimum lead date", async () => {
    statusFor(null);
    expect((await assertDateRequestable("2026-09-04", NOW)).ok).toBe(true);
  });
});
