import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import { signSessionToken } from "@/lib/adminSession";

const READ = "read-token-" + "r".repeat(40);
const FULL = "full-token-" + "f".repeat(40);

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", "s".repeat(32));
  vi.stubEnv("SUNJAE_ADMIN_API_TOKEN", FULL);
  vi.stubEnv("SUNJAE_ADMIN_API_READ_TOKEN", READ);
});
afterEach(() => vi.unstubAllEnvs());

const req = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(`http://localhost${path}`, init);
const passes = (res: Response) => res.headers.get("x-middleware-next") === "1";

describe("proxy", () => {
  it("covers /admin and /api/admin", () => {
    expect(config.matcher).toEqual(["/admin/:path*", "/api/admin/:path*"]);
  });

  it("redirects unauthenticated admin pages to login with a next param", async () => {
    const res = await proxy(req("/admin/orders/abc?x=1"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("next")).toBe("/admin/orders/abc?x=1");
  });

  it("returns 401 for unauthenticated admin API calls", async () => {
    const res = await proxy(req("/api/admin/orders"));
    expect(res.status).toBe(401);
  });

  it("always lets login and logout through", async () => {
    expect(passes(await proxy(req("/admin/login")))).toBe(true);
    expect(passes(await proxy(req("/api/admin/login", { method: "POST" })))).toBe(true);
    expect(passes(await proxy(req("/api/admin/logout", { method: "POST" })))).toBe(true);
  });

  it("accepts a valid session cookie", async () => {
    const token = await signSessionToken();
    expect(passes(await proxy(req("/admin", { headers: { cookie: `admin_session=${token}` } })))).toBe(true);
  });

  it("clears an invalid session cookie on redirect", async () => {
    const res = await proxy(req("/admin", { headers: { cookie: "admin_session=bad" } }));
    expect(res.status).toBe(307);
    expect(res.headers.get("set-cookie")).toMatch(/admin_session=;/);
  });

  it("gates the read-only token to GET", async () => {
    const auth = { authorization: `Bearer ${READ}` };
    expect(passes(await proxy(req("/api/admin/orders", { headers: auth })))).toBe(true);
    const res = await proxy(req("/api/admin/orders", { method: "POST", headers: auth }));
    expect(res.status).toBe(403);
    const full = await proxy(req("/api/admin/orders", { method: "POST", headers: { authorization: `Bearer ${FULL}` } }));
    expect(passes(full)).toBe(true);
  });

  it("does not accept bearer tokens for admin pages", async () => {
    const res = await proxy(req("/admin", { headers: { authorization: `Bearer ${FULL}` } }));
    expect(res.status).toBe(307);
  });
});
