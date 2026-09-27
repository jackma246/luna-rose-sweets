import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findMany: vi.fn(), deleteMany: vi.fn(), calls: [] as string[] }));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findMany: db.findMany }, orderImage: { deleteMany: db.deleteMany } },
}));
vi.mock("node:fs/promises", async (orig) => ({
  ...(await orig<typeof import("node:fs/promises")>()),
  rm: vi.fn(async () => {
    db.calls.push("rm");
  }),
}));

import { rm } from "node:fs/promises";
import { daysFromEnv, findPurgeCandidates, purgeExpiredOrderImages } from "@/lib/retention";
import { purgeOrderImages } from "@/lib/imageStorage";

const NOW = new Date("2026-09-25T12:00:00Z").getTime();
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000);
const order = (over: Record<string, unknown>) => ({
  id: "o", orderNumber: 1, status: "pending", updatedAt: daysAgo(0), createdAt: daysAgo(0), neededDate: null, images: [{ size: 10 }], ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  db.calls = [];
  db.deleteMany.mockImplementation(async () => {
    db.calls.push("rows");
    return { count: 1 };
  });
});

describe("findPurgeCandidates", () => {
  it("keeps a just-completed order's photos and purges them after the retention window", async () => {
    db.findMany.mockResolvedValue([order({ id: "fresh", status: "completed", updatedAt: daysAgo(1) }), order({ id: "old", status: "completed", updatedAt: daysAgo(8) })]);
    expect((await findPurgeCandidates(NOW)).map((c) => [c.orderId, c.reason])).toEqual([["old", "finished"]]);
  });

  it("purges undated, never-finished orders STALE_DAYS after they were placed", async () => {
    db.findMany.mockResolvedValue([
      order({ id: "undated-new", createdAt: daysAgo(10) }),
      order({ id: "undated-old", createdAt: daysAgo(31) }),
      order({ id: "abandoned", neededDate: daysAgo(31), createdAt: daysAgo(40) }),
      order({ id: "upcoming", neededDate: daysAgo(-3), createdAt: daysAgo(40) }),
    ]);
    expect((await findPurgeCandidates(NOW)).map((c) => [c.orderId, c.reason])).toEqual([
      ["undated-old", "undated"],
      ["abandoned", "abandoned"],
    ]);
  });
});

describe("purgeOrderImages", () => {
  it("deletes files before rows, so a failed file delete is retried on the next run", async () => {
    await purgeOrderImages("o1");
    expect(db.calls).toEqual(["rm", "rows"]);

    vi.mocked(rm).mockRejectedValueOnce(new Error("EBUSY"));
    db.findMany.mockResolvedValue([order({ id: "o2", status: "completed", updatedAt: daysAgo(30) })]);
    const result = await purgeExpiredOrderImages({ now: NOW });
    expect(result.errors).toEqual([{ orderId: "o2", message: "EBUSY" }]);
    expect(db.deleteMany).toHaveBeenCalledTimes(1); // only the first, successful purge removed rows
  });

  it("dry run deletes nothing", async () => {
    db.findMany.mockResolvedValue([order({ id: "o3", status: "cancelled", updatedAt: daysAgo(30) })]);
    const result = await purgeExpiredOrderImages({ dryRun: true, now: NOW });
    expect(result.candidates).toHaveLength(1);
    expect(rm).not.toHaveBeenCalled();
    expect(db.deleteMany).not.toHaveBeenCalled();
  });
});

describe("daysFromEnv", () => {
  it("falls back on unset or invalid values", () => {
    expect(daysFromEnv(undefined, 7)).toBe(7);
    expect(daysFromEnv("", 7)).toBe(7);
    expect(daysFromEnv("abc", 7)).toBe(7);
    expect(daysFromEnv("-2", 7)).toBe(7);
    expect(daysFromEnv("14", 7)).toBe(14);
  });
});
