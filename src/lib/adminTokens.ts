// Bearer tokens for Sunjae's admin API client. Shared by the proxy and by
// route handlers so both apply the same rules.
//
// SUNJAE_ADMIN_API_TOKEN       full admin-equivalent access (reads + writes)
// SUNJAE_ADMIN_API_READ_TOKEN  optional, read-only: GET/HEAD only

export type SunjaeTokenScope = "full" | "read";

const READ_METHODS = new Set(["GET", "HEAD"]);

export function timingSafeEqualString(a: string, b: string): boolean {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

function bearerToken(headers: Headers): string | null {
  const auth = headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/** Which Sunjae token (if any) the request presents. Does not look at the method. */
export function sunjaeTokenScope(headers: Headers): SunjaeTokenScope | null {
  const presented = bearerToken(headers);
  if (!presented) return null;

  const full = process.env.SUNJAE_ADMIN_API_TOKEN;
  if (full && timingSafeEqualString(presented, full)) return "full";

  const read = process.env.SUNJAE_ADMIN_API_READ_TOKEN;
  if (read && timingSafeEqualString(presented, read)) return "read";

  return null;
}

export function scopeAllowsMethod(scope: SunjaeTokenScope, method: string): boolean {
  return scope === "full" || READ_METHODS.has(method.toUpperCase());
}
