// Brute-force protection for POST /api/admin/login.
//
// Two layers, both in process memory:
//  - per client IP: after IP_MAX_FAILURES failed attempts inside IP_WINDOW_MS,
//    that IP is locked out until the window that started with its first
//    failure has passed.
//  - global backoff: once GLOBAL_THRESHOLD failures (from any IPs) land inside
//    GLOBAL_WINDOW_MS, every attempt must wait an exponentially growing delay
//    after the most recent failure (capped at GLOBAL_MAX_DELAY_MS). This bounds
//    the total guessing rate even when an attacker rotates IPs.
//
// In-memory state is correct for the current deployment (one Railway instance,
// one Node process). It resets on restart/deploy, and would need a shared store
// (Postgres or Redis) if the service is ever scaled to multiple instances.

export const IP_MAX_FAILURES = 5;
export const IP_WINDOW_MS = 15 * 60 * 1000;
export const GLOBAL_THRESHOLD = 20;
export const GLOBAL_WINDOW_MS = 15 * 60 * 1000;
export const GLOBAL_BASE_DELAY_MS = 1000;
export const GLOBAL_MAX_DELAY_MS = 5 * 60 * 1000;
const MAX_TRACKED_IPS = 10_000;

type IpRecord = { failures: number; windowStart: number };

export type LimitDecision = { allowed: true } | { allowed: false; retryAfterMs: number };

export class LoginRateLimiter {
  private ips = new Map<string, IpRecord>();
  private globalFailures: number[] = [];

  constructor(private now: () => number = Date.now) {}

  check(ip: string): LimitDecision {
    const now = this.now();
    this.pruneGlobal(now);

    const record = this.ips.get(ip);
    if (record && now - record.windowStart >= IP_WINDOW_MS) this.ips.delete(ip);
    const live = this.ips.get(ip);
    if (live && live.failures >= IP_MAX_FAILURES) {
      return { allowed: false, retryAfterMs: live.windowStart + IP_WINDOW_MS - now };
    }

    const globalWait = this.globalDelayRemaining(now);
    if (globalWait > 0) return { allowed: false, retryAfterMs: globalWait };

    return { allowed: true };
  }

  recordFailure(ip: string) {
    const now = this.now();
    const record = this.ips.get(ip);
    if (!record || now - record.windowStart >= IP_WINDOW_MS) {
      if (!record && this.ips.size >= MAX_TRACKED_IPS) this.evictExpired(now);
      this.ips.set(ip, { failures: 1, windowStart: now });
    } else {
      record.failures += 1;
    }
    this.globalFailures.push(now);
    this.pruneGlobal(now);
  }

  recordSuccess(ip: string) {
    this.ips.delete(ip);
  }

  private globalDelayRemaining(now: number): number {
    const excess = this.globalFailures.length - GLOBAL_THRESHOLD;
    if (excess < 0) return 0;
    const delay = Math.min(GLOBAL_BASE_DELAY_MS * 2 ** excess, GLOBAL_MAX_DELAY_MS);
    const last = this.globalFailures[this.globalFailures.length - 1];
    return Math.max(0, last + delay - now);
  }

  private pruneGlobal(now: number) {
    const cutoff = now - GLOBAL_WINDOW_MS;
    let drop = 0;
    while (drop < this.globalFailures.length && this.globalFailures[drop] <= cutoff) drop += 1;
    if (drop > 0) this.globalFailures.splice(0, drop);
  }

  private evictExpired(now: number) {
    for (const [ip, record] of this.ips) {
      if (now - record.windowStart >= IP_WINDOW_MS) this.ips.delete(ip);
    }
    // Still full of live records: drop the oldest so memory stays bounded.
    // The global backoff still limits an attacker who churns through IPs.
    while (this.ips.size >= MAX_TRACKED_IPS) {
      const oldest = this.ips.keys().next().value;
      if (oldest === undefined) break;
      this.ips.delete(oldest);
    }
  }
}

/**
 * Client IP for rate limiting. With exactly one trusted reverse proxy in front
 * of the app (Railway's edge), the right-most X-Forwarded-For entry is the
 * address that proxy saw connecting, which a client cannot forge; anything to
 * its left is client-supplied. If another proxy/CDN is ever put in front of
 * Railway, this must be revisited or every visitor shares the CDN's bucket.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

// One limiter per server process.
const globalForLimiter = globalThis as unknown as { adminLoginLimiter?: LoginRateLimiter };
export const loginRateLimiter = globalForLimiter.adminLoginLimiter ?? new LoginRateLimiter();
globalForLimiter.adminLoginLimiter = loginRateLimiter;
