import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ORDERS_FROM, SUPPORT_TO } from "@/lib/orderEmails";
import { inquirySupportEmail } from "@/lib/inquiryEmails";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_GUEST_COUNT = 80;
const MAX_MESSAGE = 4000;
const MAX_SOURCE = 80;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InquiryData {
  name: string;
  email: string;
  eventDate: Date | null;
  guestCount: string | null;
  message: string | null;
  source: string;
}

interface PersistedInquiry extends InquiryData {
  id: string;
  createdAt: Date;
}

function readString(input: unknown, max: number): string {
  return typeof input === "string" ? input.trim().slice(0, max) : "";
}

function readOptionalString(input: unknown, max: number): string | null {
  const value = readString(input, max);
  return value.length > 0 ? value : null;
}

function parseEventDate(input: unknown): Date | null | undefined {
  const value = readString(input, 20);
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(`${value}T00:00:00`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

function normalizeInquiry(input: unknown): { ok: true; data: InquiryData } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid inquiry." };
  }

  const raw = input as Record<string, unknown>;
  const name = readString(raw.name, MAX_NAME);
  const email = readString(raw.email, MAX_EMAIL).toLowerCase();
  const eventDate = parseEventDate(raw.eventDate);
  const guestCount = readOptionalString(raw.guestCount, MAX_GUEST_COUNT);
  const message = readOptionalString(raw.message, MAX_MESSAGE);
  const source = readString(raw.source, MAX_SOURCE) || "website_contact";

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (eventDate === undefined) {
    return { ok: false, error: "Enter a valid event date." };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      eventDate,
      guestCount,
      message,
      source,
    },
  };
}

async function notifySupport(inquiry: PersistedInquiry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set. Inquiry notification skipped.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: ORDERS_FROM,
      to: SUPPORT_TO,
      replyTo: inquiry.email,
      subject: `New Custom Inquiry - ${inquiry.name}`,
      html: inquirySupportEmail(inquiry),
    });

    if (result.error) {
      console.error("Inquiry notification failed:", result.error);
    }
  } catch (err) {
    console.error("Inquiry notification failed:", err);
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = normalizeInquiry(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  let inquiry: PersistedInquiry;
  try {
    inquiry = await prisma.inquiry.create({
      data: parsed.data,
    });
  } catch (err) {
    console.error("Failed to persist inquiry:", err);
    return NextResponse.json({ ok: false, error: "Could not save your inquiry." }, { status: 500 });
  }

  await notifySupport(inquiry);

  return NextResponse.json({ ok: true, id: inquiry.id });
}
