import { SignJWT, jwtVerify } from "jose";

// Single source of truth for admin session tokens. Used by the proxy, by
// route handlers (adminAuth.ts) and by server components / login (auth.ts),
// so the three can never disagree about which key or claims are valid.
//
// Deliberately free of next/headers so it can run in the proxy.

export const ADMIN_SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 7;
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;
export const MIN_SESSION_SECRET_LENGTH = 32;

/**
 * The HMAC key for admin session tokens, or null when it is not configured.
 * Fails closed: there is no fallback to ADMIN_PASSWORD, and a secret shorter
 * than MIN_SESSION_SECRET_LENGTH is treated as missing, so a misconfigured
 * deploy rejects every session instead of signing with a weak key.
 */
export function getSessionSecret(): Uint8Array | null {
  const raw = process.env.ADMIN_SESSION_SECRET || "";
  if (raw.length < MIN_SESSION_SECRET_LENGTH) return null;
  return new TextEncoder().encode(raw);
}

/** Bumping ADMIN_SESSION_VERSION revokes every existing admin session. */
export function currentSessionVersion(): string {
  return process.env.ADMIN_SESSION_VERSION?.trim() || "1";
}

export async function signSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error(
      `ADMIN_SESSION_SECRET must be set to at least ${MIN_SESSION_SECRET_LENGTH} characters.`,
    );
  }
  return await new SignJWT({ role: "admin", sv: currentSessionVersion() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload.role === "admin" && payload.sv === currentSessionVersion();
  } catch {
    return false;
  }
}

/** True when the request reached us over https (directly or via Railway's TLS proxy). */
export function isHttpsRequest(req: { headers: Headers; url: string }): boolean {
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded && forwarded.split(",")[0].trim().toLowerCase() === "https") return true;
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}
