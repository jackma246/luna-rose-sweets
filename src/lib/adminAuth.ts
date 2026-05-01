import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "admin_session";

export type AdminActor = {
  actorType: "browser_admin" | "sunjae_agent";
  actorId: string;
};

function timingSafeEqualString(a: string, b: string) {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

async function verifyBrowserAdmin(req: NextRequest): Promise<AdminActor | null> {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return { actorType: "browser_admin", actorId: "admin-session" };
  } catch {
    return null;
  }
}

function verifySunjaeToken(req: NextRequest): AdminActor | null {
  const expected = process.env.SUNJAE_ADMIN_API_TOKEN;
  if (!expected) return null;

  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  if (!timingSafeEqualString(match[1], expected)) return null;
  return { actorType: "sunjae_agent", actorId: "sunjae" };
}

export async function requireAdmin(req: NextRequest): Promise<AdminActor | NextResponse> {
  const tokenActor = verifySunjaeToken(req);
  if (tokenActor) return tokenActor;

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
