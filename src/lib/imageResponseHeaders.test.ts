import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { orderImageHeaders, safeDownloadName } from "@/lib/imageResponseHeaders";

describe("orderImageHeaders", () => {
  it("serves allowed images inline with nosniff and a sandbox CSP", () => {
    const h = orderImageHeaders({ id: "img1", originalName: "cake.jpg", mimeType: "image/jpeg" }, 10);
    expect(h["Content-Type"]).toBe("image/jpeg");
    expect(h["Content-Length"]).toBe("10");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Content-Security-Policy"]).toBe("sandbox");
    expect(h["Content-Disposition"]).toBe('inline; filename="cake.jpg"');
  });

  it("downgrades unexpected MIME types to an attachment", () => {
    const h = orderImageHeaders({ id: "img1", originalName: "x.html", mimeType: "text/html" }, 1);
    expect(h["Content-Type"]).toBe("application/octet-stream");
    expect(h["Content-Disposition"]).toMatch(/^attachment;/);
  });
});

describe("safeDownloadName", () => {
  it("strips header injection, quotes, paths and non-ASCII", () => {
    expect(safeDownloadName('a"b\r\nSet-Cookie: x=1.png', "f")).toBe("a_b_Set-Cookie_ x_1.png");
    expect(safeDownloadName("../../etc/passwd", "f")).toBe("passwd");
    expect(safeDownloadName("C:\\Users\\me\\케이크.jpg", "f")).toBe("_.jpg");
    expect(safeDownloadName("", "image-1")).toBe("image-1");
    expect(safeDownloadName("...", "image-1")).toBe("image-1");
  });
});
