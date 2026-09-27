import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(), imageDeleteMany: vi.fn(), rm: vi.fn() }));
vi.mock("@/lib/prisma", () => {
  const tx = {
    order: { findUnique: db.findUnique, update: db.update },
    orderImage: { deleteMany: db.imageDeleteMany },
  };
  return { prisma: { ...tx, $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } };
});
vi.mock("@/lib/adminAuth", () => ({
  requireAdmin: async () => ({ actorType: "admin_session", actorId: "owner" }),
  isAuthResponse: () => false,
  requireSunjaeDeleteConfirmation: () => null,
}));
vi.mock("@/lib/adminAudit", () => ({ logAdminWriteWithClient: vi.fn() }));
vi.mock("node:fs/promises", async (orig) => ({ ...(await orig<typeof import("node:fs/promises")>()), rm: db.rm }));

import { PATCH } from "./route";

const patch = (body: unknown) =>
  PATCH(new NextRequest("http://localhost/api/admin/orders/o1", { method: "PATCH", body: JSON.stringify(body) }), {
    params: Promise.resolve({ id: "o1" }),
  });

beforeEach(() => {
  vi.clearAllMocks();
  db.findUnique.mockResolvedValue({ neededDate: new Date("2026-10-01T00:00:00Z") });
  db.update.mockImplementation(async ({ data }: { data: unknown }) => ({ id: "o1", ...(data as object) }));
});

describe("PATCH /api/admin/orders/[id]", () => {
  it("does not delete photos when an order is completed (the retention job does, days later)", async () => {
    const res = await patch({ status: "completed" });
    expect(res.status).toBe(200);
    expect(db.imageDeleteMany).not.toHaveBeenCalled();
    expect(db.rm).not.toHaveBeenCalled();
  });

  it("resets remindersSent when the needed-by date changes", async () => {
    await patch({ neededDate: "2026-10-03" });
    expect(db.update.mock.calls[0][0].data).toEqual({ neededDate: new Date("2026-10-03T00:00:00Z"), remindersSent: [] });
  });

  it("keeps remindersSent when the date is unchanged", async () => {
    await patch({ neededDate: "2026-10-01", internalNotes: "call first" });
    expect(db.update.mock.calls[0][0].data).toEqual({ neededDate: new Date("2026-10-01T00:00:00Z"), internalNotes: "call first" });
  });

  it("rejects malformed dates", async () => {
    expect((await patch({ neededDate: "10/03/2026" })).status).toBe(400);
  });
});
