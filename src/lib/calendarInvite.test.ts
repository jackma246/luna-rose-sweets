import { describe, expect, it } from "vitest";
import { buildOrderInvite, foldLine } from "@/lib/calendarInvite";

const octets = (s: string) => new TextEncoder().encode(s).length;

describe("foldLine", () => {
  it("leaves short lines alone", () => {
    expect(foldLine("SUMMARY:hello")).toBe("SUMMARY:hello");
  });

  it("folds at 75 octets, not 75 characters, without splitting multi-byte characters", () => {
    const line = `DESCRIPTION:${"é".repeat(60)}${"🎂".repeat(10)}`;
    const folded = foldLine(line);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    for (const [i, part] of parts.entries()) {
      expect(octets(part)).toBeLessThanOrEqual(75);
      if (i > 0) expect(part.startsWith(" ")).toBe(true);
    }
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join("")).toBe(line);
  });
});

describe("buildOrderInvite", () => {
  it("returns base64 content that decodes to a valid all-day event", () => {
    const invite = buildOrderInvite({
      orderId: "abc",
      orderNumberLabel: "DS-0042",
      customerName: "Zoë Müller, Jr.",
      customerEmail: "zoe@example.com",
      neededDate: "2026-12-31",
      items: [{ name: "Cake Pops", variantLabel: "1 Dozen", quantity: 2, price: 40, note: "Pastel 🎀 theme; gold drizzle" }],
    });
    expect(invite.filename).toBe("order-DS0042.ics");
    expect(invite.contentType).toMatch(/^text\/calendar/);
    const ics = Buffer.from(invite.content, "base64").toString("utf8");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101\r\n");
    expect(ics).toContain("Zoë Müller\\, Jr.");
    for (const line of ics.split("\r\n")) expect(octets(line)).toBeLessThanOrEqual(75);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
