import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { signSessionToken } from "@/lib/adminSession";

const FULL = "full-token-" + "f".repeat(40);
const READ = "read-token-" + "r".repeat(40);

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", "s".repeat(32));
  vi.stubEnv("SUNJAE_ADMIN_API_TOKEN", FULL);
  vi.stubEnv("SUNJAE_ADMIN_API_READ_TOKEN", READ);
});
afterEach(() => vi.unstubAllEnvs());

function req(method: string, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/admin/orders", { method, headers });
}

describe("requireAdmin", () => {
  it("lets the full Sunjae token read and write", async () => {
    for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
      const actor = await requireAdmin(req(method, { authorization: `Bearer ${FULL}` }));
      expect(isAuthResponse(actor)).toBe(false);
      if (!isAuthResponse(actor)) expect(actor).toEqual({ actorType: "sunjae_agent", actorId: "sunjae" });
    }
  });

  it("limits the read token to GET", async () => {
    const read = await requireAdmin(req("GET", { authorization: `Bearer ${READ}` }));
    expect(read).toEqual({ actorType: "sunjae_agent", actorId: "sunjae-read" });
    for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
      const res = await requireAdmin(req(method, { authorization: `Bearer ${READ}` }));
      expect(isAuthResponse(res)).toBe(true);
      if (isAuthResponse(res)) expect(res.status).toBe(403);
    }
  });

  it("ignores the read token when it is not configured", async () => {
    vi.stubEnv("SUNJAE_ADMIN_API_READ_TOKEN", "");
    const res = await requireAdmin(req("GET", { authorization: `Bearer ${READ}` }));
    expect(isAuthResponse(res) && res.status).toBe(401);
  });

  it("accepts a valid browser session and rejects everything else", async () => {
    const token = await signSessionToken();
    const ok = await requireAdmin(req("POST", { cookie: `admin_session=${token}` }));
    expect(ok).toEqual({ actorType: "browser_admin", actorId: "admin-session" });

    const bad = await requireAdmin(req("POST", { cookie: "admin_session=nope" }));
    expect(isAuthResponse(bad) && bad.status).toBe(401);
    const none = await requireAdmin(req("GET"));
    expect(isAuthResponse(none) && none.status).toBe(401);
  });

  it("rejects browser sessions when the session secret is missing", async () => {
    const token = await signSessionToken();
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    const res = await requireAdmin(req("GET", { cookie: `admin_session=${token}` }));
    expect(isAuthResponse(res) && res.status).toBe(401);
  });
});
