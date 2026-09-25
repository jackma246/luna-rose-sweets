import { NextRequest, NextResponse } from "next/server";
import { mkdir, rm, writeFile } from "node:fs/promises";
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
  money,
  supportEmail,
  type CartItem,
} from "@/lib/orderEmails";
import { buildOrderInvite } from "@/lib/calendarInvite";
import { assertDateRequestable } from "@/lib/availability";
import { toDbDate } from "@/lib/businessDate";
import { orderUploadDir } from "@/lib/imageStorage";
import { clientIp, orderRequestLimiter, rateLimitMessage } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/requestBody";
import { describeError } from "@/lib/logging";
import { ORDER_LIMITS, validateOrderRequest, type ValidatedOrder } from "@/lib/orderRequest";
import { isHoneypotTripped } from "@/lib/honeypot";

type Warning = "email_not_configured" | "support_email_failed" | "confirmation_email_failed" | "photos_not_saved";

/**
 * Write the verified photos to disk and record them as OrderImage rows. Returns the stored items with
 * each photo's OrderImage id filled in. Photo bytes never go into Order.items.
 */
async function savePhotos(orderId: string, order: ValidatedOrder): Promise<{ items: CartItem[]; saved: number }> {
  if (order.items.every((i) => i.images.length === 0)) return { items: order.items.map((i) => i.stored), saved: 0 };

  const dir = orderUploadDir(orderId);
  await mkdir(dir, { recursive: true });
  let saved = 0;
  const items: CartItem[] = [];
  for (const item of order.items) {
    if (item.images.length === 0) {
      items.push(item.stored);
      continue;
    }
    const meta = [];
    for (const image of item.images) {
      const filename = `${randomUUID()}${image.ext}`;
      await writeFile(path.join(dir, filename), image.bytes);
      const row = await prisma.orderImage.create({
        data: { orderId, filename, originalName: image.name, mimeType: image.mime, size: image.bytes.byteLength },
        select: { id: true },
      });
      meta.push({ name: image.name, type: image.mime, size: image.bytes.byteLength, imageId: row.id });
      saved += 1;
    }
    items.push({ ...item.stored, inspirationImages: meta });
  }
  return { items, saved };
}

async function sendEmail(resend: Resend, payload: Parameters<Resend["emails"]["send"]>[0], what: string): Promise<boolean> {
  try {
    // Resend reports API failures in { error } and does not throw.
    const result = await resend.emails.send(payload);
    if (result.error) {
      console.error(`Order ${what} email failed:`, result.error.name, result.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Order ${what} email failed:`, describeError(err));
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limit = orderRequestLimiter.check(ip);
  if (limit.limited) {
    return NextResponse.json(
      { ok: false, error: rateLimitMessage(limit) },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const parsed = await readJsonBody(req, ORDER_LIMITS.bodyBytes);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status });

  if (isHoneypotTripped(parsed.body)) {
    // Look like success so the bot moves on; persist and send nothing.
    orderRequestLimiter.hit(ip);
    return NextResponse.json({ ok: true });
  }

  const validation = validateOrderRequest(parsed.body);
  if (!validation.ok) return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  const order = validation.order;
  const { customer } = order;

  // Authoritative check: blocked (closed / fully booked) days, past dates and short notice (the longest
  // lead time in the cart) are rejected here regardless of what the client-side picker allowed.
  const check = await assertDateRequestable(customer.neededDate, { leadDays: order.leadDays });
  if (!check.ok) return NextResponse.json({ ok: false, error: check.reason }, { status: 400 });

  // Only accepted requests count toward the limit, so a customer fixing a typo is never locked out.
  orderRequestLimiter.hit(ip);

  let orderId: string;
  let orderNumberLabel: string;
  try {
    const created = await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || null,
        items: order.items.map((i) => i.stored) as unknown as object[],
        totalPrice: order.serverTotal,
        neededDate: toDbDate(customer.neededDate),
        customerNotes: customer.message || null,
        internalNotes: order.pricingNotes.length > 0 ? `Price check:\n${order.pricingNotes.join("\n")}` : null,
        status: "pending",
      },
    });
    orderId = created.id;
    orderNumberLabel = formatOrderNumber(created.orderNumber);
  } catch (err) {
    // Nothing was saved: do not tell the customer it was received. They can retry or email us.
    console.error("Failed to persist order:", describeError(err));
    return NextResponse.json(
      { ok: false, error: "We couldn't save your order - please try again, or email supportdipsprinkle@gmail.com." },
      { status: 500 },
    );
  }

  // From here on the order exists. Always answer ok so the customer does not resubmit a duplicate;
  // anything that went wrong is returned as a warning and logged for the owner.
  const warnings: Warning[] = [];
  let items: CartItem[] = order.items.map((i) => i.stored);

  try {
    const result = await savePhotos(orderId, order);
    if (result.saved > 0) {
      items = result.items;
      await prisma.order.update({
        where: { id: orderId },
        data: {
          items: items as unknown as object[],
          customerNotes: [customer.message, `Inspiration photos uploaded: ${result.saved}`].filter(Boolean).join("\n"),
        },
      });
    }
  } catch (err) {
    console.error(`Failed to save photos for ${orderNumberLabel}:`, describeError(err));
    warnings.push("photos_not_saved");
    items = order.items.map((i) => i.stored);
    await rm(orderUploadDir(orderId), { recursive: true, force: true }).catch(() => {});
    await prisma.orderImage.deleteMany({ where: { orderId } }).catch(() => {});
  }

  if (order.pricingNotes.length > 0) {
    console.warn(`Order ${orderNumberLabel}: ${order.pricingNotes.length} pricing note(s) recorded in internal notes.`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY is not set; order ${orderNumberLabel} saved without emails.`);
    warnings.push("email_not_configured");
    return NextResponse.json({ ok: true, orderNumber: orderNumberLabel, warnings });
  }

  const resend = new Resend(apiKey);
  const neededDateLabel = formatLongDate(customer.neededDate);
  const priceStr = money(order.serverTotal);
  const invite = buildOrderInvite({
    orderId,
    orderNumberLabel,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone || null,
    neededDate: customer.neededDate,
    items,
    customerNotes: customer.message || null,
  });

  const [supportOk, confirmationOk] = await Promise.all([
    sendEmail(
      resend,
      {
        from: ORDERS_FROM,
        to: SUPPORT_TO,
        replyTo: customer.email,
        subject: `New Order Request — ${customer.name} — $${priceStr} (${orderNumberLabel})`,
        html: supportEmail(customer, items, [], order.serverTotal, orderNumberLabel, neededDateLabel),
        attachments: [invite],
      },
      "support",
    ),
    sendEmail(
      resend,
      {
        from: ORDERS_FROM,
        to: customer.email,
        replyTo: SUPPORT_TO,
        subject: `Your Dip & Sprinkle order is pending — $${priceStr} (${orderNumberLabel})`,
        html: customerConfirmEmail(customer, items, [], order.serverTotal, orderNumberLabel, neededDateLabel),
      },
      "confirmation",
    ),
  ]);
  if (!supportOk) warnings.push("support_email_failed");
  if (!confirmationOk) warnings.push("confirmation_email_failed");

  return NextResponse.json({ ok: true, orderNumber: orderNumberLabel, ...(warnings.length > 0 ? { warnings } : {}) });
}
