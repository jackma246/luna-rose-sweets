import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Bearer-token check for /api/cron/* endpoints. Fails closed: without CRON_SECRET configured the
 * endpoints refuse to run (503) instead of running for anyone. Compared in constant time.
 * Returns a response to send when the request is not allowed, or null when it is.
 */
export function cronAuthFailure(authorization: string | null): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Cron is not configured." }, { status: 503 });
  }
  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  const given = Buffer.from(authorization ?? "", "utf8");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  return null;
}
