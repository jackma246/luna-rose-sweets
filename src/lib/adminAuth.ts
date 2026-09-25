import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";
import { scopeAllowsMethod, sunjaeTokenScope } from "@/lib/adminTokens";

export type AdminActor = {
  actorType: "browser_admin" | "sunjae_agent";
  actorId: string;
};

async function verifyBrowserAdmin(req: NextRequest): Promise<AdminActor | null> {
  const ok = await verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  return ok ? { actorType: "browser_admin", actorId: "admin-session" } : null;
}

export async function requireAdmin(req: NextRequest): Promise<AdminActor | NextResponse> {
  const scope = sunjaeTokenScope(req.headers);
  if (scope) {
    if (!scopeAllowsMethod(scope, req.method)) {
      return NextResponse.json(
        { ok: false, error: "This token is read-only." },
        { status: 403 },
      );
    }
    return { actorType: "sunjae_agent", actorId: scope === "full" ? "sunjae" : "sunjae-read" };
  }

  const browserActor = await verifyBrowserAdmin(req);
  if (browserActor) return browserActor;

  return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

export function isAuthResponse(value: AdminActor | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export function requireSunjaeDeleteConfirmation(req: NextRequest, actor: AdminActor, resource: string, id: string): NextResponse | null {
  if (actor.actorType !== "sunjae_agent") return null;
  const expected = `Approve delete ${resource} ${id}`;
  const actual = req.headers.get("x-sunjae-confirm-delete") || "";
  if (actual === expected) return null;
  return NextResponse.json(
    { ok: false, error: `Deletion requires header x-sunjae-confirm-delete: ${expected}` },
    { status: 409 },
  );
}
