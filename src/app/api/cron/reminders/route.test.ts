import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const db = vi.hoisted(() => ({ findMany: vi.fn(), update: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { order: { findMany: db.findMany, update: db.update } } }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: db.send };
  },
}));

import { GET, windowDueDateKey } from "./route";

const order = {
  id: "o1",
  orderNumber: 7,
  customerName: "Sam <b>",
  customerEmail: "sam@example.com",
  customerPhone: null,
  items: [{ name: "Cake Pops", quantity: "<script>", price: 40 }],
  totalPrice: 40,
  neededDate: new Date("2026-09-04T00:00:00Z"),
  customerNotes: null,
  internalNotes: null,
  status: "confirmed",
  remindersSent: [],
};

const get = (auth = "Bearer cron-secret") =>
  GET(new NextRequest("http://localhost/api/cron/reminders", { headers: auth ? { authorization: auth } : {} }));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "cron-secret";
  process.env.RESEND_API_KEY = "re_test";
  db.findMany.mockImplementation(async ({ where }: { where: { neededDate: Date } }) =>
    where.neededDate.getTime() === order.neededDate.getTime() ? [order] : [],
  );
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-02T01:00:00Z")); // Tue Sep 1, 6pm PT: UTC is already Sep 2
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/cron/reminders", () => {
  it("computes windows from the Los Angeles day", () => {
    expect(windowDueDateKey(0)).toBe("2026-09-01");
    expect(windowDueDateKey(3)).toBe("2026-09-04");
  });

  it("fails closed when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    expect((await get()).status).toBe(503);
    expect(db.findMany).not.toHaveBeenCalled();
  });

  it("rejects a wrong token", async () => {
    expect((await get("Bearer nope")).status).toBe(401);
  });

  it("marks reminders sent only when Resend accepted the email", async () => {
    db.send.mockResolvedValue({ data: null, error: { name: "rate_limit_exceeded", message: "slow down" } });
    const res = await get();
    expect(await res.json()).toMatchObject({ ok: false, failed: ["d3"] });
    expect(db.update).not.toHaveBeenCalled();

    db.send.mockResolvedValue({ data: { id: "e" }, error: null });
    const ok = await get();
    expect(await ok.json()).toMatchObject({ ok: true, summary: { d3: 1, d2: 0, d0: 0 } });
    expect(db.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { remindersSent: { push: "d3" } } });
  });

  it("escapes and number-coerces order data in the email", async () => {
    db.send.mockResolvedValue({ data: { id: "e" }, error: null });
    await get();
    const html: string = db.send.mock.calls[0][0].html;
    expect(html).not.toMatch(/<script>|Sam <b>/);
    expect(html).toContain("Friday, September 4");
  });
});
