import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import {
  SESSION_MAX_AGE_SECONDS,
  getSessionSecret,
  isHttpsRequest,
  signSessionToken,
  verifySessionToken,
} from "@/lib/adminSession";

const GOOD_SECRET = "s".repeat(32);

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("ADMIN_SESSION_SECRET", GOOD_SECRET);
  vi.stubEnv("ADMIN_PASSWORD", "hunter2-hunter2-hunter2-hunter2-hunter2");
  vi.stubEnv("ADMIN_SESSION_VERSION", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("session secret", () => {
  it("fails closed without ADMIN_SESSION_SECRET and never falls back to ADMIN_PASSWORD", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    expect(getSessionSecret()).toBeNull();
    await expect(signSessionToken()).rejects.toThrow(/ADMIN_SESSION_SECRET/);

    // A token signed with the password (the old fallback key) must not verify.
    const legacy = await new SignJWT({ role: "admin", sv: "1" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(process.env.ADMIN_PASSWORD));
    expect(await verifySessionToken(legacy)).toBe(false);
  });

  it("rejects a secret shorter than 32 characters", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "x".repeat(31));
    expect(getSessionSecret()).toBeNull();
  });

  it("round-trips a token with a valid secret", async () => {
    const token = await signSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("garbage")).toBe(false);
  });

  it("rejects tokens signed with a different secret", async () => {
    const token = await signSessionToken();
    vi.stubEnv("ADMIN_SESSION_SECRET", "t".repeat(32));
    expect(await verifySessionToken(token)).toBe(false);
  });
});

describe("session lifetime and version", () => {
  it("expires after 7 days", async () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(7 * 24 * 60 * 60);
    const token = await signSessionToken();
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
  });

  it("revokes every session when ADMIN_SESSION_VERSION is bumped", async () => {
    const token = await signSessionToken(); // default version "1"
    expect(await verifySessionToken(token)).toBe(true);
    vi.stubEnv("ADMIN_SESSION_VERSION", "2");
    expect(await verifySessionToken(token)).toBe(false);
    expect(await verifySessionToken(await signSessionToken())).toBe(true);
  });

  it("rejects pre-upgrade tokens that carry no sv claim", async () => {
    const old = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(GOOD_SECRET));
    expect(await verifySessionToken(old)).toBe(false);
  });
});

describe("isHttpsRequest", () => {
  const req = (url: string, proto?: string) => ({
    url,
    headers: new Headers(proto ? { "x-forwarded-proto": proto } : {}),
  });
  it("detects https from the URL or the forwarded proto", () => {
    expect(isHttpsRequest(req("https://dipsprinkle.com/api/admin/login"))).toBe(true);
    expect(isHttpsRequest(req("http://localhost:8080/api/admin/login", "https"))).toBe(true);
    expect(isHttpsRequest(req("http://localhost:8080/api/admin/login", "https, http"))).toBe(true);
    expect(isHttpsRequest(req("http://localhost:3000/api/admin/login"))).toBe(false);
    expect(isHttpsRequest(req("http://localhost:3000/api/admin/login", "http"))).toBe(false);
  });
});
