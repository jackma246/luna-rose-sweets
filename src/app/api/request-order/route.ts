import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { formatOrderNumber } from "@/lib/orderNumber";
import {
  ORDERS_FROM,
  SUPPORT_TO,
  customerConfirmEmail,
  formatLongDate,
  supportEmail,
  type CartItem,
  type CustomerInfo,
} from "@/lib/orderEmails";
import { buildOrderInvite } from "@/lib/calendarInvite";
import { ALLOWED_MIME, MAX_IMAGE_BYTES, extensionFromMime, orderUploadDir } from "@/lib/imageStorage";

function dataUrlToBuffer(dataUrl: string): Buffer | null {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return Buffer.from(match[2], "base64");
}

async function saveInspirationImages(orderId: string, items: CartItem[]): Promise<number> {
  const images = items.flatMap((item) => item.inspirationImages ?? []);
  if (images.length === 0) return 0;

  const dir = orderUploadDir(orderId);
  await mkdir(dir, { recursive: true });

  let saved = 0;
  for (const image of images.slice(0, 20)) {
    if (!ALLOWED_MIME.includes(image.type)) continue;
    if (image.size > MAX_IMAGE_BYTES) continue;
    const buffer = dataUrlToBuffer(image.dataUrl ?? "");
    if (!buffer || buffer.byteLength > MAX_IMAGE_BYTES) continue;

    const filename = `${randomUUID()}${extensionFromMime(image.type, image.name)}`;
    await writeFile(path.join(dir, filename), buffer);
    await prisma.orderImage.create({
      data: {
        orderId,
        filename,
        originalName: image.name,
        mimeType: image.type,
        size: buffer.byteLength,
      },
    });
    saved += 1;
  }
  return saved;
}

export async function POST(req: NextRequest) {
  const { items, totalPrice, customer } = (await req.json()) as {
    items: CartItem[];
    totalPrice: number;
    customer: CustomerInfo;
  };

  if (!customer?.name || !customer?.email) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json({ ok: false, error: "Email service not configured." }, { status: 500 });
  }

  const neededDateLabel = formatLongDate(customer.neededDate);
  const resend = new Resend(apiKey);
  const priceStr = Number(totalPrice).toFixed(2);

  let orderId: string | undefined;
  let orderNumberLabel: string | undefined;
  try {
    const created = await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || null,
        items: items as unknown as object[],
        totalPrice,
        neededDate: customer.neededDate ? new Date(customer.neededDate + "T00:00:00") : null,
        customerNotes: customer.message || null,
        status: "pending",
      },
    });
    orderId = created.id;
    orderNumberLabel = formatOrderNumber(created.orderNumber);
    const imageCount = await saveInspirationImages(created.id, items);
    if (imageCount > 0) {
      await prisma.order.update({
        where: { id: created.id },
        data: {
          customerNotes: [customer.message, `Inspiration photos uploaded: ${imageCount}`].filter(Boolean).join("\n"),
        },
      });
    }
  } catch (err) {
    console.error("Failed to persist order:", err);
    // Fall through — we still want to send emails even if DB write fails,
    // so the order isn't lost. Owner can backfill manually via /admin/orders/new.
  }

  const subjectSuffix = orderNumberLabel ? ` (${orderNumberLabel})` : "";

  const supportAttachments =
    orderId && customer.neededDate
      ? [
          buildOrderInvite({
            orderId,
            orderNumberLabel,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone || null,
            neededDate: customer.neededDate,
            items,
            customerNotes: customer.message || null,
          }),
        ]
      : undefined;

  try {
    const [support, confirmation] = await Promise.all([
      resend.emails.send({
        from: ORDERS_FROM,
        to: SUPPORT_TO,
        replyTo: customer.email,
        subject: `New Order Request — ${customer.name} — $${priceStr}${subjectSuffix}`,
        html: supportEmail(customer, items, [], totalPrice, orderNumberLabel, neededDateLabel),
        attachments: supportAttachments,
      }),
      resend.emails.send({
        from: ORDERS_FROM,
        to: customer.email,
        replyTo: SUPPORT_TO,
        subject: `Your Dip & Sprinkle order is pending — $${priceStr}${subjectSuffix}`,
        html: customerConfirmEmail(customer, items, [], totalPrice, orderNumberLabel, neededDateLabel),
      }),
    ]);

    if (support.error || confirmation.error) {
      console.error("Email send error:", support.error, confirmation.error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
