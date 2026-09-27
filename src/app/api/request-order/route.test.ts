import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { addDaysToKey, todayKey } from "@/lib/businessDate";
import { orderRequestLimiter } from "@/lib/rateLimit";
import { PNG_BYTES, pngDataUrl } from "@/lib/testFixtures";

const db = vi.hoisted(() => ({
  orderCreate: vi.fn(),
  orderUpdate: vi.fn(),
  imageCreate: vi.fn(),
  imageDeleteMany: vi.fn(),
  availabilityFindUnique: vi.fn(),
  send: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { create: db.orderCreate, update: db.orderUpdate },
    orderImage: { create: db.imageCreate, deleteMany: db.imageDeleteMany },
    availabilityDate: { findUnique: db.availabilityFindUnique, findMany: vi.fn() },
  },
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: db.send };
  },
}));

import { POST } from "./route";

const uploads = mkdtempSync(path.join(os.tmpdir(), "acore-uploads-"));
process.env.UPLOADS_DIR = uploads;
afterAll(() => rmSync(uploads, { recursive: true, force: true }));

const NEEDED = addDaysToKey(todayKey(), 30);

function orderBody(over: Record<string, unknown> = {}) {
  return {
    customer: { name: "Sam Rivera", email: "sam@example.com", phone: "408-555-0100", neededDate: NEEDED, message: "Blue & gold theme" },
    totalPrice: 54,
    items: [
      {
        productSlug: "cakesicles",
        variantLabel: "1 Dozen",
        name: "Cakesicles",
        price: 54,
        quantity: 1,
        flavour: "Funfetti",
        selection: { kind: "product", flavour: "Funfetti", designTier: "Classic", addons: [] },
      },
    ],
    ...over,
  };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return POST(
    new NextRequest("http://localhost/api/request-order", {
      method: "POST",
      body: text,
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.5", ...headers },
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  orderRequestLimiter.reset();
  process.env.RESEND_API_KEY = "re_test_key";
  db.availabilityFindUnique.mockResolvedValue(null);
  db.orderCreate.mockResolvedValue({ id: "order_1", orderNumber: 42 });
  db.orderUpdate.mockResolvedValue({});
  db.imageCreate.mockImplementation(async () => ({ id: `img_${db.imageCreate.mock.calls.length}` }));
  db.send.mockResolvedValue({ data: { id: "email" }, error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("POST /api/request-order", () => {
  it("persists the order, emails support and the customer, and returns the order number", async () => {
    const res = await post(orderBody());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, orderNumber: "DS-0042" });
    expect(db.orderCreate).toHaveBeenCalledTimes(1);
    const data = db.orderCreate.mock.calls[0][0].data;
    expect(data.totalPrice).toBe(54);
    expect(data.neededDate).toEqual(new Date(`${NEEDED}T00:00:00Z`));
    expect(db.send).toHaveBeenCalledTimes(2);
  });

  it("still answers ok (with a warning) when an email fails after the order was saved", async () => {
    db.send.mockImplementation(async (payload: { to: string }) =>
      payload.to === "sam@example.com" ? { data: null, error: { name: "validation_error", message: "bad" } } : { data: { id: "x" }, error: null },
    );
    const res = await post(orderBody());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, orderNumber: "DS-0042", warnings: ["confirmation_email_failed"] });
  });

  it("still answers ok when the email API throws", async () => {
    db.send.mockRejectedValue(new Error("network down"));
    const res = await post(orderBody());
    expect(res.status).toBe(200);
    expect((await res.json()).warnings).toEqual(["support_email_failed", "confirmation_email_failed"]);
  });

  it("does not email the customer and returns an error when the order cannot be saved", async () => {
    db.orderCreate.mockRejectedValue(Object.assign(new Error("Invalid `prisma.order.create()` invocation:\n{ customerName: \"Sam Rivera\" }\nCan't reach database server"), { code: "P1001" }));
    const res = await post(orderBody());
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
    expect(db.send).not.toHaveBeenCalled();
    // Logs carry the error code and reason, never the customer's data from the query.
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).toMatch(/P1001/);
    expect(logged).not.toMatch(/Sam Rivera|sam@example\.com/);
  });

  it("saves the order without emails when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const res = await post(orderBody());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, orderNumber: "DS-0042", warnings: ["email_not_configured"] });
    expect(db.orderCreate).toHaveBeenCalledTimes(1);
    expect(db.send).not.toHaveBeenCalled();
  });

  it("stores the server-computed total, not the client's", async () => {
    const res = await post(orderBody({ totalPrice: 0.01, items: [{ ...orderBody().items[0], price: 0.01 }] }));
    expect(res.status).toBe(200);
    const data = db.orderCreate.mock.calls[0][0].data;
    expect(data.totalPrice).toBe(54);
    expect(data.internalNotes).toMatch(/Price check/);
    expect(db.send.mock.calls[0][0].subject).toMatch(/\$54\.00/);
  });

  it("silently drops honeypot submissions", async () => {
    const res = await post(orderBody({ website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(db.orderCreate).not.toHaveBeenCalled();
    expect(db.send).not.toHaveBeenCalled();
  });

  it("rejects bodies over the size cap before parsing", async () => {
    const res = await post(orderBody(), { "content-length": String(31 * 1024 * 1024) });
    expect(res.status).toBe(413);
    expect(db.orderCreate).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
  });

  it("rejects an email relay attempt with HTML in the quantity", async () => {
    const body = orderBody();
    const res = await post({ ...body, items: [{ ...body.items[0], quantity: "<a href=https://evil.example>claim</a>" }] });
    expect(res.status).toBe(400);
    expect(db.orderCreate).not.toHaveBeenCalled();
    expect(db.send).not.toHaveBeenCalled();
  });

  it("escapes customer text in both emails", async () => {
    await post(orderBody({ customer: { ...orderBody().customer, name: "<img src=x onerror=alert(1)>", message: "<script>x</script>" } }));
    for (const call of db.send.mock.calls) {
      expect(call[0].html).not.toMatch(/<img src=x|<script>/);
      expect(call[0].html).toMatch(/&lt;script&gt;/);
    }
  });

  it("enforces the longest lead time in the cart", async () => {
    const tooSoon = addDaysToKey(todayKey(), 4);
    const body = orderBody({
      customer: { ...orderBody().customer, neededDate: tooSoon },
      items: [{ productSlug: "party-two-tier-cake", variantLabel: "Two-Tier Tall Cake (6\"&4\") — serves 15–18", price: 185, quantity: 1, selection: { kind: "product", flavour: "Chocolate", designTier: "Classic", addons: [] } }],
    });
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/7 days notice/);
  });

  it("rate limits after 5 accepted orders per hour from one IP", async () => {
    for (let i = 0; i < 5; i += 1) expect((await post(orderBody())).status).toBe(200);
    const limited = await post(orderBody());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    expect(db.orderCreate).toHaveBeenCalledTimes(5);
    expect((await post(orderBody(), { "x-forwarded-for": "198.51.100.1" })).status).toBe(200);
  });

  it("saves photos as files and OrderImage rows and never stores their data in Order.items", async () => {
    const body = orderBody();
    const res = await post({
      ...body,
      items: [{ ...body.items[0], inspirationImages: [{ name: "idea.png", type: "image/png", size: PNG_BYTES.length, dataUrl: pngDataUrl() }] }],
    });
    expect(res.status).toBe(200);
    const created = JSON.stringify(db.orderCreate.mock.calls[0][0].data.items);
    expect(created).not.toMatch(/dataUrl|base64/);
    expect(db.imageCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ orderId: "order_1", originalName: "idea.png", mimeType: "image/png", filename: expect.stringMatching(/\.png$/) }),
      select: { id: true },
    });
    const updated = db.orderUpdate.mock.calls[0][0].data.items;
    expect(updated[0].inspirationImages).toEqual([{ name: "idea.png", type: "image/png", size: PNG_BYTES.length, imageId: "img_1" }]);
    const files = readdirSync(path.join(uploads, "orders", "order_1"));
    expect(files).toHaveLength(1);
    expect(readFileSync(path.join(uploads, "orders", "order_1", files[0])).equals(PNG_BYTES)).toBe(true);
  });

  it("attaches the calendar invite as base64 so Resend decodes it to the ICS text", async () => {
    await post(orderBody());
    const support = db.send.mock.calls.find((c) => c[0].to !== "sam@example.com")![0];
    const ics = Buffer.from(support.attachments[0].content, "base64").toString("utf8");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain(`DTSTART;VALUE=DATE:${NEEDED.replace(/-/g, "")}`);
  });
});
