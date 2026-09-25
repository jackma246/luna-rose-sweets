import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({ updateMany: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn() }));
vi.mock("@/lib/prisma", () => {
  const tx = { inventoryItem: { updateMany: db.updateMany, findUnique: db.findUnique, findUniqueOrThrow: db.findUniqueOrThrow } };
  return { prisma: { ...tx, $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } };
});
vi.mock("@/lib/adminAuth", () => ({
  requireAdmin: async () => ({ actorType: "admin_session", actorId: "owner" }),
  isAuthResponse: () => false,
}));
vi.mock("@/lib/adminAudit", () => ({ logAdminWriteWithClient: vi.fn() }));

import { POST } from "./route";

const adjust = (delta: number) =>
  POST(new NextRequest("http://localhost/api/admin/inventory/i1/adjust", { method: "POST", body: JSON.stringify({ delta }) }), {
    params: Promise.resolve({ id: "i1" }),
  });

beforeEach(() => vi.clearAllMocks());

describe("POST /api/admin/inventory/[id]/adjust", () => {
  it("increments atomically in the database with a floor guard", async () => {
    db.updateMany.mockResolvedValue({ count: 1 });
    db.findUniqueOrThrow.mockResolvedValue({ id: "i1", quantity: 3, lowStockThreshold: null });
    const res = await adjust(-2);
    expect(res.status).toBe(200);
    expect(db.updateMany).toHaveBeenCalledWith({ where: { id: "i1", quantity: { gte: 2 } }, data: { quantity: { increment: -2 } } });
    expect((await res.json()).item.quantity).toBe(3);
  });

  it("refuses to go below zero", async () => {
    db.updateMany.mockResolvedValue({ count: 0 });
    db.findUnique.mockResolvedValue({ id: "i1" });
    const res = await adjust(-100);
    expect(res.status).toBe(400);
  });

  it("404s for a missing item", async () => {
    db.updateMany.mockResolvedValue({ count: 0 });
    db.findUnique.mockResolvedValue(null);
    expect((await adjust(1)).status).toBe(404);
  });
});
