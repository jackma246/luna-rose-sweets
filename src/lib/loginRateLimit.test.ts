import { describe, expect, it } from "vitest";
import {
  GLOBAL_MAX_DELAY_MS,
  GLOBAL_THRESHOLD,
  IP_MAX_FAILURES,
  IP_WINDOW_MS,
  LoginRateLimiter,
} from "@/lib/loginRateLimit";

function limiterAt(start = 1_000_000) {
  const clock = { t: start };
  return { clock, limiter: new LoginRateLimiter(() => clock.t) };
}

describe("per-IP limit", () => {
  it("locks an IP out after repeated failures until the window passes", () => {
    const { clock, limiter } = limiterAt();
    for (let i = 0; i < IP_MAX_FAILURES; i += 1) {
      expect(limiter.check("1.1.1.1").allowed).toBe(true);
      limiter.recordFailure("1.1.1.1");
      clock.t += 1000;
    }
    const blocked = limiter.check("1.1.1.1");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.retryAfterMs).toBeGreaterThan(0);

    // Other IPs are unaffected.
    expect(limiter.check("2.2.2.2").allowed).toBe(true);

    clock.t += IP_WINDOW_MS;
    expect(limiter.check("1.1.1.1").allowed).toBe(true);
  });

  it("clears the IP record on success", () => {
    const { limiter } = limiterAt();
    for (let i = 0; i < IP_MAX_FAILURES - 1; i += 1) limiter.recordFailure("1.1.1.1");
    limiter.recordSuccess("1.1.1.1");
    limiter.recordFailure("1.1.1.1");
    expect(limiter.check("1.1.1.1").allowed).toBe(true);
  });
});

describe("global backoff", () => {
  it("slows everyone down once failures across many IPs pass the threshold", () => {
    const { clock, limiter } = limiterAt();
    for (let i = 0; i < GLOBAL_THRESHOLD; i += 1) {
      limiter.recordFailure(`10.0.0.${i}`);
      clock.t += 10;
    }
    const fresh = limiter.check("192.168.1.1");
    expect(fresh.allowed).toBe(false);

    clock.t += 1000;
    expect(limiter.check("192.168.1.1").allowed).toBe(true);

    // Each extra failure doubles the delay, up to the cap.
    for (let i = 0; i < 30; i += 1) limiter.recordFailure(`10.1.0.${i}`);
    const capped = limiter.check("192.168.1.1");
    expect(capped.allowed).toBe(false);
    if (!capped.allowed) expect(capped.retryAfterMs).toBeLessThanOrEqual(GLOBAL_MAX_DELAY_MS);
  });
});
