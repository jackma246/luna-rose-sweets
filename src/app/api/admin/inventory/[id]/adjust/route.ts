import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
  const { id } = await params;
  const body = (await req.json()) as { delta: number };

  if (typeof body.delta !== "number" || !Number.isFinite(body.delta) || body.delta === 0) {
    return NextResponse.json({ ok: false, error: "delta must be a non-zero number." }, { status: 400 });
  }

  // Atomic read-modify-write: the increment happens in the database, guarded so stock can never go
  // below zero even when two adjustments race (the old read-then-write could lose one of them).
  const result = await prisma.$transaction(async (tx) => {
    const applied = await tx.inventoryItem.updateMany({
      where: { id, ...(body.delta < 0 ? { quantity: { gte: -body.delta } } : {}) },
      data: { quantity: { increment: body.delta } },
    });
    if (applied.count === 0) {
      const exists = await tx.inventoryItem.findUnique({ where: { id }, select: { id: true } });
      return exists ? ("insufficient" as const) : ("missing" as const);
    }
    const updated = await tx.inventoryItem.findUniqueOrThrow({ where: { id } });

    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "inventory.adjust",
      targetType: "inventory_item",
      targetId: id,
      requestJson: body,
      responseJson: { id, previousQuantity: Number(updated.quantity) - body.delta, quantity: Number(updated.quantity) },
      ok: true,
    });

    return updated;
  });

  if (result === "missing") return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  if (result === "insufficient") return NextResponse.json({ ok: false, error: "Not enough on hand." }, { status: 400 });
  const item = result;

  return NextResponse.json({
    ok: true,
    item: {
      ...item,
      quantity: Number(item.quantity),
      lowStockThreshold: item.lowStockThreshold === null ? null : Number(item.lowStockThreshold),
    },
  });
}
