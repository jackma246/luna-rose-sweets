import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/safeNextPath";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/orders/abc?tab=1#x")).toBe("/admin/orders/abc?tab=1#x");
  });

  it("falls back to /admin for missing values", () => {
    expect(safeNextPath(null)).toBe("/admin");
    expect(safeNextPath(undefined)).toBe("/admin");
    expect(safeNextPath("")).toBe("/admin");
  });

  it("rejects open redirects and script URLs", () => {
    for (const bad of [
      "javascript:alert(document.cookie)",
      "JavaScript:alert(1)",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      " /admin",
      "admin",
      "data:text/html,<script>alert(1)</script>",
    ]) {
      expect(safeNextPath(bad), bad).toBe("/admin");
    }
  });
});
