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

  const current = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const next = Number(current.quantity) + body.delta;
  if (next < 0) {
    return NextResponse.json({ ok: false, error: "Not enough on hand." }, { status: 400 });
  }

  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.inventoryItem.update({
      where: { id },
      data: { quantity: next },
    });

    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "inventory.adjust",
      targetType: "inventory_item",
      targetId: id,
      requestJson: body,
      responseJson: { id, previousQuantity: Number(current.quantity), quantity: next },
      ok: true,
    });

    return updated;
  });

  return NextResponse.json({
    ok: true,
    item: {
      ...item,
      quantity: Number(item.quantity),
      lowStockThreshold: item.lowStockThreshold === null ? null : Number(item.lowStockThreshold),
    },
  });
}
