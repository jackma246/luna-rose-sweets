import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await clearSessionCookie();
  // The admin header's "Sign out" button is a plain form post, so send the
  // browser back to the login page instead of rendering a JSON body.
  if (!(req.headers.get("accept") || "").includes("application/json")) {
    return new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  }
  return NextResponse.json({ ok: true });
}
