import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { decideMarketplaceReply } = vi.hoisted(() => ({ decideMarketplaceReply: vi.fn() }));
vi.mock("@/lib/facebookMarketplaceReplies", () => ({ decideMarketplaceReply }));

import { POST } from "@/app/api/facebook/marketplace/webhook/route";

const SECRET = "app-secret";
const CUSTOMER_TEXT = "Hi I'm Jane Doe, 555-867-5309, how much are cake pops?";

function payload() {
  return JSON.stringify({
    object: "page",
    entry: [
      {
        id: "1234567890",
        messaging: [
          { sender: { id: "psid-1" }, recipient: { id: "1234567890" }, message: { mid: "m_1", text: CUSTOMER_TEXT } },
        ],
      },
    ],
  });
}

function signed(body: string, secret = SECRET) {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function post(body: string, signature?: string) {
  return new NextRequest("http://localhost/api/facebook/marketplace/webhook", {
    method: "POST",
    body,
    headers: signature ? { "x-hub-signature-256": signature } : {},
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("FB_APP_SECRET", SECRET);
  vi.stubEnv("FB_PAGE_ACCESS_TOKEN", "page-token-xyz");
  vi.stubEnv("SUNJAE_TELEGRAM_BOT_TOKEN", "");
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
  vi.stubEnv("SUNJAE_TELEGRAM_CHAT_ID", "");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  decideMarketplaceReply.mockReset();
  decideMarketplaceReply.mockImplementation(async (message: string, context: Record<string, unknown>) => ({
    action: "auto_reply",
    intent: "price",
    language: "en",
    reply: "Cake pops start at $30 a dozen.",
    source: "deterministic_rules",
    confidence: "high",
    customerMessage: message,
    context,
  }));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("facebook marketplace webhook POST", () => {
  it("fails closed with 403 when FB_APP_SECRET is not set, even for unsigned payloads", async () => {
    vi.stubEnv("FB_APP_SECRET", "");
    const res = await POST(post(payload()));
    expect(res.status).toBe(403);
    expect(decideMarketplaceReply).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects bad or missing signatures", async () => {
    const body = payload();
    expect((await POST(post(body))).status).toBe(403);
    expect((await POST(post(body, signed(body, "wrong")))).status).toBe(403);
    expect(decideMarketplaceReply).not.toHaveBeenCalled();
  });

  it("sends the reply through the Send API with the page token", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const body = payload();
    const res = await POST(post(body, signed(body)));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://graph.facebook.com/v19.0/me/messages?access_token=page-token-xyz");
    expect(init.method).toBe("POST");
  });

  it("does not log customer message text when delivery fails", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 400 }));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const body = payload();
    await POST(post(body, signed(body)));
    expect(log).toHaveBeenCalled();
    const logged = log.mock.calls.flat().join(" ");
    expect(logged).toContain("m_1");
    expect(logged).not.toContain("Jane");
    expect(logged).not.toContain("867-5309");
    expect(logged).not.toContain("psid-1");
    expect(logged).not.toContain("Cake pops start");
  });
});
