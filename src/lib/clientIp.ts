/**
 * Client IP for rate limiting. Railway's edge sets X-Real-IP to the connecting
 * address and overwrites any client-supplied value, so it is the trusted
 * source. X-Forwarded-For is only a fallback (local dev, other hosts): its
 * right-most entry is the one the nearest proxy appended; anything to the left
 * is client-supplied and never used. If a CDN is ever put in front of Railway,
 * revisit this or every visitor shares the CDN's bucket.
 */
export function clientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 100);
  const parts = (headers.get("x-forwarded-for") ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  return (parts[parts.length - 1] ?? "unknown").slice(0, 100);
}
