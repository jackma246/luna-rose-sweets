import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  isHttpsRequest,
  signSessionToken,
  verifySessionToken,
} from "@/lib/adminSession";

export async function setSessionCookie(req: { headers: Headers; url: string }) {
  const token = await signSessionToken();
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || isHttpsRequest(req),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return await verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Hash both sides so the comparison is constant-time and does not leak the length.
  return timingSafeEqual(sha256(input), sha256(expected));
}
