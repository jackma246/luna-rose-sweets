/**
 * In-memory sliding-window rate limiter for public form endpoints.
 *
 * The site runs as a single Railway instance, so process memory is a sufficient store. If it is ever
 * scaled out, each instance would enforce its own window (a looser limit, never a stricter one).
 */

export interface RateLimiterOptions {
  /** Maximum hits allowed per key inside the window. */
  limit: number;
  windowMs: number;
  /** Upper bound on tracked keys, so a flood of distinct IPs cannot grow memory without limit. */
  maxKeys?: number;
}

export interface RateLimitStatus {
  limited: boolean;
  /** Seconds until the oldest hit leaves the window (0 when not limited). */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitStatus;
  hit(key: string, now?: number): void;
  reset(): void;
}

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  function recent(key: string, now: number): number[] {
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length === 0) hits.delete(key);
    else hits.set(key, list);
    return list;
  }

  return {
    check(key, now = Date.now()) {
      const list = recent(key, now);
      if (list.length < limit) return { limited: false, retryAfterSeconds: 0 };
      return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((list[0] + windowMs - now) / 1000)) };
    },
    hit(key, now = Date.now()) {
      const list = recent(key, now);
      list.push(now);
      hits.delete(key); // re-insert so Map order tracks recency
      hits.set(key, list);
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
    },
    reset() {
      hits.clear();
    },
  };
}

/** Client IP for rate limiting: the first hop of x-forwarded-for (set by Railway's edge), else x-real-ip. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const ip = first || headers.get("x-real-ip")?.trim() || "unknown";
  return ip.slice(0, 100);
}

const HOUR = 60 * 60 * 1000;

/** Accepted order requests per IP per hour. */
export const orderRequestLimiter = createRateLimiter({ limit: 5, windowMs: HOUR });
/** Accepted contact inquiries per IP per hour. */
export const inquiryLimiter = createRateLimiter({ limit: 5, windowMs: HOUR });

export function rateLimitMessage(status: RateLimitStatus): string {
  const minutes = Math.max(1, Math.ceil(status.retryAfterSeconds / 60));
  return `Too many requests from your connection - please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or email supportdipsprinkle@gmail.com.`;
}
