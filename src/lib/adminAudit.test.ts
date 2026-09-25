import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { REDACTED, logAdminWriteWithClient, redactForAudit } from "@/lib/adminAudit";

function fakeClient() {
  const create = vi.fn().mockResolvedValue({});
  return { create, client: { adminAuditLog: { create } } as never };
}

describe("logAdminWriteWithClient", () => {
  it("audits browser-session writes, not only Sunjae token writes", async () => {
    const { create, client } = fakeClient();
    await logAdminWriteWithClient(client, {
      actor: { actorType: "browser_admin", actorId: "admin-session" },
      method: "PATCH",
      path: "/api/admin/orders/o1",
      action: "order.patch",
      targetType: "order",
      targetId: "o1",
      requestJson: { status: "ready" },
      ok: true,
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].data).toMatchObject({
      actorType: "browser_admin",
      action: "order.patch",
      requestJson: { status: "ready" },
    });
  });

  it("stores request and response bodies with PII redacted", async () => {
    const { create, client } = fakeClient();
    await logAdminWriteWithClient(client, {
      actor: { actorType: "sunjae_agent", actorId: "sunjae" },
      method: "POST",
      path: "/api/admin/orders",
      requestJson: {
        customerName: "Ava Bennett",
        customerEmail: "ava@example.com",
        customerPhone: "(555) 123-4567",
        customerNotes: "Leave at 12 Main St",
        status: "confirmed",
        totalPrice: 42,
      },
      responseJson: { id: "o1", customerEmail: "ava@example.com" },
      ok: true,
    });
    const data = create.mock.calls[0][0].data;
    expect(data.requestJson).toEqual({
      customerName: REDACTED,
      customerEmail: REDACTED,
      customerPhone: REDACTED,
      customerNotes: REDACTED,
      status: "confirmed",
      totalPrice: 42,
    });
    expect(data.responseJson).toEqual({ id: "o1", customerEmail: REDACTED });
    expect(JSON.stringify(data)).not.toMatch(/ava@example\.com|Ava Bennett|123-4567/);
  });
});

describe("redactForAudit", () => {
  it("redacts nested PII, image data and PII embedded in free text", () => {
    const out = redactForAudit({
      items: [{ label: "Dozen", quantity: 1 }],
      files: [{ name: "IMG_0001.jpg", type: "image/jpeg", size: 1234 }],
      image: "iVBORw0KGgo...",
      preview: "data:image/png;base64,iVBORw0KGgo",
      vendor: "Call me at 555.123.4567 or mail bob@example.com",
      date: "2026-05-01",
      delta: -2,
      nothing: null,
    });
    expect(out).toEqual({
      items: [{ label: "Dozen", quantity: 1 }],
      files: [{ name: REDACTED, type: "image/jpeg", size: 1234 }],
      image: REDACTED,
      preview: REDACTED,
      vendor: `Call me at ${REDACTED} or mail ${REDACTED}`,
      date: "2026-05-01",
      delta: -2,
      nothing: null,
    });
  });

  it("passes undefined through", () => {
    expect(redactForAudit(undefined)).toBeUndefined();
  });
});
