import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { decideMarketplaceReply, type MarketplaceDecision } from "@/lib/facebookMarketplaceReplies";

export const runtime = "nodejs";

type FacebookMessaging = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: { mid?: string; text?: string };
  marketplace_listing?: { title?: string };
};

type FacebookWebhookPayload = {
  object?: string;
  entry?: Array<{ id?: string; time?: number; messaging?: FacebookMessaging[] }>;
};

interface ProcessedMessage {
  senderId: string;
  messageId?: string;
  action: MarketplaceDecision["action"];
  intent: MarketplaceDecision["intent"];
  delivered: "facebook" | "telegram" | "local_only" | "skipped";
}

function verifyToken(): string {
  return process.env.FB_MARKETPLACE_VERIFY_TOKEN || "";
}

function appSecret(): string {
  return process.env.FB_APP_SECRET || "";
}

function pageAccessToken(): string {
  return process.env.FB_PAGE_ACCESS_TOKEN || "";
}

function telegramConfig(): { token: string; chatId: string } | null {
  const token = process.env.SUNJAE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.SUNJAE_TELEGRAM_CHAT_ID || "";
  return token && chatId ? { token, chatId } : null;
}

function safeLogPayload(decision: MarketplaceDecision): Record<string, unknown> {
  return {
    action: decision.action,
    intent: decision.intent,
    language: decision.language,
    source: decision.source,
    confidence: decision.confidence,
    context: decision.context,
    customerMessage: decision.customerMessage,
    reply: decision.reply,
    escalationId: decision.escalationId,
    sunjaeMessageKo: decision.sunjaeMessageKo,
  };
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = appSecret();
  if (!secret) return true;
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signatureHeader);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

async function sendFacebookMessage(recipientId: string, text: string): Promise<boolean> {
  const token = pageAccessToken();
  if (!token) return false;
  const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
  });
  return response.ok;
}

async function sendTelegramToSunjae(text: string): Promise<boolean> {
  const cfg = telegramConfig();
  if (!cfg) return false;
  const response = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: cfg.chatId, text }),
  });
  return response.ok;
}

async function processMessage(messaging: FacebookMessaging): Promise<ProcessedMessage | null> {
  const senderId = messaging.sender?.id || "";
  const text = messaging.message?.text?.trim() || "";
  if (!senderId || !text) return null;

  const decision = await decideMarketplaceReply(text, {
    senderId,
    listingTitle: messaging.marketplace_listing?.title,
    messageId: messaging.message?.mid,
  });

  if (decision.action === "auto_reply" && decision.reply) {
    const delivered = await sendFacebookMessage(senderId, decision.reply);
    if (!delivered) console.log("facebook_marketplace_decision", JSON.stringify(safeLogPayload(decision)));
    return { senderId, messageId: messaging.message?.mid, action: decision.action, intent: decision.intent, delivered: delivered ? "facebook" : "local_only" };
  }

  if (decision.sunjaeMessageKo) {
    const delivered = await sendTelegramToSunjae(decision.sunjaeMessageKo);
    if (!delivered) console.log("facebook_marketplace_decision", JSON.stringify(safeLogPayload(decision)));
    return { senderId, messageId: messaging.message?.mid, action: decision.action, intent: decision.intent, delivered: delivered ? "telegram" : "local_only" };
  }

  return { senderId, messageId: messaging.message?.mid, action: decision.action, intent: decision.intent, delivered: "skipped" };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") || "";

  if (mode === "subscribe" && verifyToken() && token === verifyToken()) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ ok: false, error: "verification_failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 403 });
  }

  let payload: FacebookWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as FacebookWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const processed: ProcessedMessage[] = [];
  for (const entry of payload.entry || []) {
    for (const messaging of entry.messaging || []) {
      const row = await processMessage(messaging);
      if (row) processed.push(row);
    }
  }

  return NextResponse.json({ ok: true, processed });
}
