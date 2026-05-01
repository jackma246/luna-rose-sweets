import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  return new TextEncoder().encode(raw);
}

function timingSafeEqualString(a: string, b: string) {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

function hasValidSunjaeToken(req: NextRequest) {
  const expected = process.env.SUNJAE_ADMIN_API_TOKEN;
  if (!expected) return false;
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return timingSafeEqualString(match[1], expected);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/") && hasValidSunjaeToken(req)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
