import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

async function headerRules() {
  return (await nextConfig.headers!()) as Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
}

function valueFor(rule: { headers: Array<{ key: string; value: string }> }, key: string) {
  return rule.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
}

describe("next.config security headers", () => {
  it("disables the x-powered-by header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("sends the baseline security headers on every path", async () => {
    const all = (await headerRules()).find((r) => r.source === "/:path*")!;
    expect(valueFor(all, "Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains");
    expect(valueFor(all, "X-Frame-Options")).toBe("DENY");
    expect(valueFor(all, "X-Content-Type-Options")).toBe("nosniff");
    expect(valueFor(all, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(valueFor(all, "Permissions-Policy")).toContain("camera=()");
    const csp = valueFor(all, "Content-Security-Policy")!;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("default-src 'self'");
  });

  it("overrides the CSP with a sandbox for uploaded order images, after the site-wide rule", async () => {
    const rules = await headerRules();
    const allIndex = rules.findIndex((r) => r.source === "/:path*");
    const imageIndex = rules.findIndex((r) => r.source === "/api/admin/orders/:id/images/:imageId");
    expect(imageIndex).toBeGreaterThan(allIndex);
    expect(valueFor(rules[imageIndex], "Content-Security-Policy")).toMatch(/^sandbox(;|$)/);
  });
});
