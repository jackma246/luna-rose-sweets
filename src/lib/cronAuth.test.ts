import { afterEach, describe, expect, it } from "vitest";
import { cronAuthFailure } from "@/lib/cronAuth";

afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe("cronAuthFailure", () => {
  it("fails closed with 503 when CRON_SECRET is not configured", () => {
    delete process.env.CRON_SECRET;
    expect(cronAuthFailure("Bearer anything")?.status).toBe(503);
    expect(cronAuthFailure(null)?.status).toBe(503);
  });

  it("rejects a missing or wrong bearer token with 401", () => {
    process.env.CRON_SECRET = "s3cret";
    expect(cronAuthFailure(null)?.status).toBe(401);
    expect(cronAuthFailure("Bearer nope")?.status).toBe(401);
    expect(cronAuthFailure("Bearer s3cret ")?.status).toBe(401);
  });

  it("allows the correct token", () => {
    process.env.CRON_SECRET = "s3cret";
    expect(cronAuthFailure("Bearer s3cret")).toBeNull();
  });
});
