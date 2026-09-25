import { describe, expect, it } from "vitest";
import { clientIp } from "@/lib/clientIp";

describe("clientIp", () => {
  it("trusts X-Real-IP, which Railway's edge sets and overwrites", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.2", "x-forwarded-for": "6.6.6.6" }))).toBe("198.51.100.2");
  });

  it("never uses the client-supplied left side of X-Forwarded-For", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIp(new Headers({ "x-forwarded-for": " 203.0.113.1 " }))).toBe("203.0.113.1");
  });

  it("falls back to a shared bucket when nothing identifies the client", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
