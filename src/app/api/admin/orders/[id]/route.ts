import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { ORDER_SOURCES } from "@/lib/orderSources";
import { purgeOrderImages } from "@/lib/imageStorage";
import type { OrderStatus, OrderSource, Prisma } from "@/generated/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as {
    status?: OrderStatus;
    source?: OrderSource;
    internalNotes?: string | null;
    customerNotes?: string | null;
    neededDate?: string | null;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string | null;
    totalPrice?: number;
    items?: unknown;
    adjustments?: unknown;
  };

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.source !== undefined) {
    if (!ORDER_SOURCES.includes(body.source)) {
      return NextResponse.json({ ok: false, error: "Invalid source." }, { status: 400 });
    }
    data.source = body.source;
  }
  if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes;
  if (body.customerNotes !== undefined) data.customerNotes = body.customerNotes;
  if (body.neededDate !== undefined) {
    data.neededDate = body.neededDate ? new Date(body.neededDate + "T00:00:00") : null;
  }
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
  if (body.totalPrice !== undefined) data.totalPrice = body.totalPrice;
  if (body.items !== undefined) {
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ ok: false, error: "Items must be an array." }, { status: 400 });
    }
    data.items = body.items as Prisma.InputJsonValue;
  }
  if (body.adjustments !== undefined) {
    if (!Array.isArray(body.adjustments)) {
      return NextResponse.json({ ok: false, error: "Adjustments must be an array." }, { status: 400 });
    }
    const cleaned: Array<{ label: string; amount: number }> = [];
    for (const raw of body.adjustments) {
      if (!raw || typeof raw !== "object") {
        return NextResponse.json({ ok: false, error: "Invalid adjustment row." }, { status: 400 });
      }
      const r = raw as { label?: unknown; amount?: unknown };
      const label = typeof r.label === "string" ? r.label.trim() : "";
      const amount = typeof r.amount === "number" && Number.isFinite(r.amount) ? r.amount : NaN;
      if (!Number.isFinite(amount)) {
        return NextResponse.json({ ok: false, error: "Adjustment amount must be a number." }, { status: 400 });
      }
      cleaned.push({ label, amount });
    }
    data.adjustments = cleaned as unknown as Prisma.InputJsonValue;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const order = await prisma.order.update({ where: { id }, data });

  // Free up volume space once an order is finished — the design photos aren't needed anymore.
  if (data.status === "completed") {
    try {
      await purgeOrderImages(id);
    } catch (err) {
      console.error("Failed to purge images for completed order:", err);
    }
  }

  return NextResponse.json({ ok: true, order });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Wipe images from disk before the cascade removes the DB rows.
  try {
    await purgeOrderImages(id);
  } catch (err) {
    console.error("Failed to purge images for deleted order:", err);
  }
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
