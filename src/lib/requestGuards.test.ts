import { describe, expect, it } from "vitest";
import { clientIp, createRateLimiter } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/requestBody";
import { describeError } from "@/lib/logging";
import { decodeDataUrl, sniffImageType } from "@/lib/imageStorage";
import { isHoneypotTripped } from "@/lib/honeypot";
import { HTML_DATA_URL, JPEG_BYTES, PNG_BYTES } from "@/lib/testFixtures";

describe("rate limiter", () => {
  it("allows `limit` hits per window per key, then reports when to retry", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    rl.hit("a", 0);
    rl.hit("a", 100);
    expect(rl.check("a", 200)).toEqual({ limited: true, retryAfterSeconds: 1 });
    expect(rl.check("b", 200).limited).toBe(false);
    expect(rl.check("a", 1001).limited).toBe(false);
  });

  it("bounds memory by evicting the least recently used keys", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    rl.hit("a", 0);
    rl.hit("b", 0);
    rl.hit("c", 0);
    expect(rl.check("a", 1).limited).toBe(false);
    expect(rl.check("c", 1).limited).toBe(true);
  });

  it("keys by the first x-forwarded-for hop", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": " 203.0.113.1 , 10.0.0.2" }))).toBe("203.0.113.1");
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.3" }))).toBe("198.51.100.3");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("readJsonBody", () => {
  const req = (body: string | ReadableStream<Uint8Array>, headers: Record<string, string> = {}) =>
    new Request("http://x", { method: "POST", body, headers, duplex: "half" } as RequestInit);

  it("rejects a declared Content-Length over the cap without reading", async () => {
    expect(await readJsonBody(req("{}", { "content-length": "999" }), 10)).toMatchObject({ ok: false, status: 413 });
  });

  it("stops reading a chunked body once it passes the cap", async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(new Uint8Array(8).fill(32));
      },
    });
    expect(await readJsonBody(req(stream), 64)).toMatchObject({ ok: false, status: 413 });
  });

  it("parses JSON and rejects garbage", async () => {
    expect(await readJsonBody(req('{"a":1}'), 100)).toEqual({ ok: true, body: { a: 1 } });
    expect(await readJsonBody(req("{a:1}"), 100)).toMatchObject({ ok: false, status: 400 });
  });
});

describe("describeError", () => {
  it("keeps the code and final reason but drops the query dump with customer data", () => {
    const err = Object.assign(new Error('\nInvalid `prisma.order.create()` invocation:\n{\n  data: { customerEmail: "sam@example.com", customerNotes: "my address is 1 Main St" }\n}\nUnique constraint failed on the fields: (`id`)'), {
      name: "PrismaClientKnownRequestError",
      code: "P2002",
    });
    const text = describeError(err);
    expect(text).toBe("PrismaClientKnownRequestError P2002: Unique constraint failed on the fields: (`id`)");
    expect(text).not.toMatch(/sam@example|Main St/);
  });
});

describe("image sniffing", () => {
  it("identifies images by magic bytes", () => {
    expect(sniffImageType(PNG_BYTES)?.mime).toBe("image/png");
    expect(sniffImageType(JPEG_BYTES)?.ext).toBe(".jpg");
    expect(sniffImageType(Buffer.from("GIF89a....."))?.mime).toBe("image/gif");
    expect(sniffImageType(Buffer.from("RIFF\0\0\0\0WEBPVP8 "))?.mime).toBe("image/webp");
    expect(sniffImageType(Buffer.from("\0\0\0\x18ftypheic\0\0\0\0"))?.ext).toBe(".heic");
    expect(sniffImageType(Buffer.from("\0\0\0\x18ftypmif1\0\0\0\0"))?.mime).toBe("image/heif");
    expect(sniffImageType(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(sniffImageType(decodeDataUrl(HTML_DATA_URL)!)).toBeNull();
  });

  it("decodes only well-formed base64 data URLs", () => {
    expect(decodeDataUrl("data:image/png;base64,iVBORw0KGgo=")?.length).toBe(8);
    expect(decodeDataUrl("data:image/png,rawtext")).toBeNull();
    expect(decodeDataUrl("data:image/png;base64,abc")).toBeNull();
    expect(decodeDataUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("honeypot", () => {
  it("trips on any non-empty value", () => {
    expect(isHoneypotTripped({ website: "x" })).toBe(true);
    expect(isHoneypotTripped({ website: "  " })).toBe(false);
    expect(isHoneypotTripped({ website: "" })).toBe(false);
    expect(isHoneypotTripped({})).toBe(false);
    expect(isHoneypotTripped(null)).toBe(false);
  });
});
