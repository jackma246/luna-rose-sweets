import { NextRequest, NextResponse } from "next/server";
import { checkPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await setSessionCookie();
  return NextResponse.json({ ok: true });
}
