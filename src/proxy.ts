import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";
import { scopeAllowsMethod, sunjaeTokenScope } from "@/lib/adminTokens";

// Optimistic gate for /admin and /api/admin. Every admin page and route handler
// also enforces auth on its own (requireAdminPage / requireAdmin), so this is
// defense in depth, not the only check.

function loginRedirect(req: NextRequest) {
  const url = new URL("/admin/login", req.url);
  const { pathname, search } = req.nextUrl;
  if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/admin/");

  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    // Signing out must work even with an expired or revoked session.
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  if (isApi) {
    const scope = sunjaeTokenScope(req.headers);
    if (scope) {
      if (!scopeAllowsMethod(scope, req.method)) {
        return NextResponse.json({ ok: false, error: "This token is read-only." }, { status: 403 });
      }
      return NextResponse.next();
    }
  }

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const res = loginRedirect(req);
  if (token) res.cookies.delete(ADMIN_SESSION_COOKIE);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
