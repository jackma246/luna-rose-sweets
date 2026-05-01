import { rm } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { ORDER_SOURCES } from "@/lib/orderSources";
import { orderUploadDir } from "@/lib/imageStorage";
import type { OrderStatus, OrderSource, Prisma } from "@/generated/prisma";
import { isAuthResponse, requireAdmin, requireSunjaeDeleteConfirmation } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { images: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    order: {
      ...order,
      totalPrice: Number(order.totalPrice),
      neededDate: order.neededDate ? order.neededDate.toISOString().slice(0, 10) : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      images: order.images.map((image) => ({
        ...image,
        createdAt: image.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
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

  const shouldPurgeImages = data.status === "completed";
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id }, data });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "order.patch",
      targetType: "order",
      targetId: id,
      requestJson: body,
      responseJson: { id },
      ok: true,
    });

    if (shouldPurgeImages) {
      const deleted = await tx.orderImage.deleteMany({ where: { orderId: id } });
      await logAdminWriteWithClient(tx, {
        actor,
        method: req.method,
        path: req.nextUrl.pathname,
        action: "order_image.purge_completed_order",
        targetType: "order",
        targetId: id,
        responseJson: { orderId: id, deletedImageRows: deleted.count },
        ok: true,
      });
    }

    return updated;
  });

  // Free up volume space once an order is finished. DB row deletion is audited in the transaction above.
  if (shouldPurgeImages) {
    try {
      await rm(orderUploadDir(id), { recursive: true, force: true });
    } catch (err) {
      console.error("Failed to remove upload directory for completed order:", err);
    }
  }


  return NextResponse.json({ ok: true, order });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
  const { id } = await params;
  const confirmation = requireSunjaeDeleteConfirmation(req, actor, "order", id);
  if (confirmation) return confirmation;
  const uploadDir = orderUploadDir(id);
  await prisma.$transaction(async (tx) => {
    await tx.order.delete({ where: { id } });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "order.delete",
      targetType: "order",
      targetId: id,
      responseJson: { id },
      ok: true,
    });
  });
  try {
    await rm(uploadDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to remove upload directory for deleted order:", err);
  }
  return NextResponse.json({ ok: true });
}
