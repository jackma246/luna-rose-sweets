import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { ORDER_SOURCES } from "@/lib/orderSources";
import { formatOrderNumber } from "@/lib/orderNumber";
import {
  ORDERS_FROM,
  SUPPORT_TO,
  formatLongDate,
  supportEmail,
  type Adjustment,
  type CartItem,
} from "@/lib/orderEmails";
import { buildOrderInvite } from "@/lib/calendarInvite";
import type { OrderStatus, OrderSource } from "@/generated/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

interface NewOrderItem {
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
}

function sanitizeAdjustments(input: unknown): Adjustment[] {
  if (!Array.isArray(input)) return [];
  const out: Adjustment[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as { label?: unknown; amount?: unknown };
    const label = typeof r.label === "string" ? r.label.trim() : "";
    const amount = typeof r.amount === "number" && Number.isFinite(r.amount) ? r.amount : NaN;
    if (!Number.isFinite(amount)) continue;
    out.push({ label, amount });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const orders = await prisma.order.findMany({
    orderBy: [{ neededDate: "asc" }, { createdAt: "desc" }],
    take: 500,
  });
  return NextResponse.json({
    ok: true,
    orders: orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      neededDate: order.neededDate ? order.neededDate.toISOString().slice(0, 10) : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const body = (await req.json()) as {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: NewOrderItem[];
    adjustments?: unknown;
    totalPrice: number;
    neededDate?: string;
    customerNotes?: string;
    internalNotes?: string;
    status?: OrderStatus;
    source?: OrderSource;
  };

  if (!body.customerName || !body.customerEmail) {
    return NextResponse.json({ ok: false, error: "Name and email required." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, error: "At least one item required." }, { status: 400 });
  }
  const status: OrderStatus = body.status && ORDER_STATUSES.includes(body.status) ? body.status : "pending";
  const source: OrderSource = body.source && ORDER_SOURCES.includes(body.source) ? body.source : "website";
  const adjustments = sanitizeAdjustments(body.adjustments);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || null,
        items: body.items as unknown as object[],
        adjustments: adjustments as unknown as object[],
        totalPrice: body.totalPrice,
        neededDate: body.neededDate ? new Date(body.neededDate + "T00:00:00") : null,
        customerNotes: body.customerNotes || null,
        internalNotes: body.internalNotes || null,
        status,
        source,
      },
    });

    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "order.create",
      targetType: "order",
      targetId: created.id,
      requestJson: body,
      responseJson: { id: created.id, orderNumber: created.orderNumber },
      ok: true,
    });

    return created;
  });

  // Notify support with optional .ics calendar invite. Failures shouldn't block order creation.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const orderNumberLabel = formatOrderNumber(order.orderNumber);
    const neededDateLabel = formatLongDate(body.neededDate);
    const priceStr = Number(body.totalPrice).toFixed(2);
    const customer = {
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone || null,
      neededDate: body.neededDate,
      message: body.customerNotes || null,
    };
    const items = body.items as CartItem[];
    const attachments = body.neededDate
      ? [
          buildOrderInvite({
            orderId: order.id,
            orderNumberLabel,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            neededDate: body.neededDate,
            items,
            customerNotes: customer.message,
          }),
        ]
      : undefined;
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: ORDERS_FROM,
        to: SUPPORT_TO,
        replyTo: body.customerEmail,
        subject: `[Admin] New Order — ${body.customerName} — $${priceStr} (${orderNumberLabel})`,
        html: supportEmail(customer, items, adjustments, body.totalPrice, orderNumberLabel, neededDateLabel, "Admin-Created Order"),
        attachments,
      });
    } catch (err) {
      console.error("Admin order support email failed:", err);
    }
  }


  return NextResponse.json({ ok: true, id: order.id });
}
