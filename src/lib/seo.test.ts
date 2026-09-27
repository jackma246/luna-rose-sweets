import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "@/lib/seo";

describe("normalizeSiteUrl", () => {
  it("accepts a bare host, which is how production is configured", () => {
    expect(normalizeSiteUrl("dipsprinkle.com")).toBe("https://dipsprinkle.com");
  });

  it("keeps a full URL and drops paths and trailing slashes", () => {
    expect(normalizeSiteUrl("https://dipsprinkle.com/")).toBe("https://dipsprinkle.com");
    expect(normalizeSiteUrl("http://localhost:3000/x")).toBe("http://localhost:3000");
  });

  it("falls back instead of throwing on missing or unusable values", () => {
    expect(normalizeSiteUrl(undefined)).toBe("https://dipsprinkle.com");
    expect(normalizeSiteUrl("   ")).toBe("https://dipsprinkle.com");
    expect(normalizeSiteUrl("ftp://dipsprinkle.com")).toBe("https://dipsprinkle.com");
    expect(normalizeSiteUrl("not a url")).toBe("https://dipsprinkle.com");
  });
});
