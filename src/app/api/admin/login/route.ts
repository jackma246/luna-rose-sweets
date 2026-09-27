import { NextRequest, NextResponse } from "next/server";
import { checkPassword, setSessionCookie } from "@/lib/auth";
import { getSessionSecret } from "@/lib/adminSession";
import { clientIp, loginRateLimiter } from "@/lib/loginRateLimit";

export async function POST(req: NextRequest) {
  let password: unknown;
  try {
    ({ password } = (await req.json()) as { password?: unknown });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ ok: false, error: "Password is required." }, { status: 400 });
  }

  if (!getSessionSecret()) {
    console.error("Admin login refused: ADMIN_SESSION_SECRET is missing or shorter than 32 characters.");
    return NextResponse.json({ ok: false, error: "Admin login is not configured." }, { status: 503 });
  }

  const ip = clientIp(req.headers);
  const decision = loginRateLimiter.check(ip);
  if (!decision.allowed) {
    const retryAfter = Math.max(1, Math.ceil(decision.retryAfterMs / 1000));
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  if (!checkPassword(password)) {
    loginRateLimiter.recordFailure(ip);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  loginRateLimiter.recordSuccess(ip);
  await setSessionCookie(req);
  return NextResponse.json({ ok: true });
}
