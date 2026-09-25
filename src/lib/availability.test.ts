import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { availabilityDate: { findUnique, findMany: vi.fn() } } }));

import { assertDateRequestable, isBlockedStatus, minRequestableDateKey } from "@/lib/availability";

// Fixed "now": Tuesday 2026-09-01 10:00 in Los Angeles (17:00 UTC).
const NOW = new Date("2026-09-01T17:00:00Z");
// 6pm PT on Tuesday 2026-09-01 is already Wednesday 01:00 in UTC (and 10:00 in Tokyo).
const EVENING_PT = new Date("2026-09-02T01:00:00Z");

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

describe("minRequestableDateKey", () => {
  it("is today + 3 in Los Angeles", () => {
    expect(minRequestableDateKey(NOW)).toBe("2026-09-04");
  });
  it("still counts from the Los Angeles day between 5pm and midnight PT", () => {
    expect(minRequestableDateKey(EVENING_PT)).toBe("2026-09-04");
  });
  it("honours a longer product lead time", () => {
    expect(minRequestableDateKey(NOW, 7)).toBe("2026-09-08");
  });
});

describe("assertDateRequestable", () => {
  it("rejects bad format without touching the DB", async () => {
    const r = await assertDateRequestable("09/05/2026", { now: NOW });
    expect(r.ok).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });
  it("rejects impossible dates", async () => {
    expect((await assertDateRequestable("2026-02-30", { now: NOW })).ok).toBe(false);
  });
  it("rejects past dates", async () => {
    const r = await assertDateRequestable("2026-08-30", { now: NOW });
    expect(r).toMatchObject({ ok: false });
    expect(findUnique).not.toHaveBeenCalled();
  });
  it("rejects dates under the 3 day lead time", async () => {
    const r = await assertDateRequestable("2026-09-03", { now: NOW });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/3 days notice/);
  });
  it("rejects dates under a product's longer lead time", async () => {
    statusFor(null);
    const r = await assertDateRequestable("2026-09-05", { now: NOW, leadDays: 5 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/5 days notice for this order.*Sunday, September 6/);
    expect((await assertDateRequestable("2026-09-06", { now: NOW, leadDays: 5 })).ok).toBe(true);
  });
  it("accepts the minimum date at 6pm PT even though UTC is already the next day", async () => {
    statusFor(null);
    expect((await assertDateRequestable("2026-09-04", { now: EVENING_PT })).ok).toBe(true);
  });
  it("rejects closed days with a customer-facing reason", async () => {
    statusFor("closed");
    const r = await assertDateRequestable("2026-09-05", { now: NOW });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/closed on Saturday, September 5/);
  });
  it("queries the DB with the UTC-midnight date", async () => {
    statusFor(null);
    await assertDateRequestable("2026-09-05", { now: NOW });
    expect(findUnique).toHaveBeenCalledWith({ where: { date: new Date("2026-09-05T00:00:00Z") } });
  });
  it("rejects fully booked days", async () => {
    statusFor("fully_booked");
    const r = await assertDateRequestable("2026-09-05", { now: NOW });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/fully booked/);
  });
  it("allows limited days", async () => {
    statusFor("limited");
    expect(await assertDateRequestable("2026-09-05", { now: NOW })).toEqual({ ok: true, status: "limited" });
  });
  it("allows available and unmarked days", async () => {
    statusFor("available");
    expect(await assertDateRequestable("2026-09-05", { now: NOW })).toEqual({ ok: true, status: "available" });
    statusFor(null);
    expect(await assertDateRequestable("2026-09-06", { now: NOW })).toEqual({ ok: true, status: null });
  });
  it("allows exactly the minimum lead date", async () => {
    statusFor(null);
    expect((await assertDateRequestable("2026-09-04", { now: NOW })).ok).toBe(true);
  });
});
