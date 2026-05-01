import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INVENTORY_CATEGORIES } from "@/lib/inventoryCategories";
import type { InventoryCategory } from "@/generated/prisma";
import { isAuthResponse, requireAdmin, requireSunjaeDeleteConfirmation } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    item: {
      ...item,
      quantity: Number(item.quantity),
      lowStockThreshold: item.lowStockThreshold === null ? null : Number(item.lowStockThreshold),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    quantity?: number;
    unit?: string | null;
    category?: InventoryCategory;
    lowStockThreshold?: number | null;
    notes?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.quantity !== undefined) {
    if (body.quantity < 0) {
      return NextResponse.json({ ok: false, error: "Quantity can't be negative." }, { status: 400 });
    }
    data.quantity = body.quantity;
  }
  if (body.unit !== undefined) data.unit = body.unit?.trim() || null;
  if (body.category !== undefined) {
    if (!INVENTORY_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ ok: false, error: "Invalid category." }, { status: 400 });
    }
    data.category = body.category;
  }
  if (body.lowStockThreshold !== undefined) data.lowStockThreshold = body.lowStockThreshold;
  if (body.notes !== undefined) data.notes = body.notes;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.inventoryItem.update({ where: { id }, data });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "inventory.patch",
      targetType: "inventory_item",
      targetId: id,
      requestJson: body,
      responseJson: { id },
      ok: true,
    });
    return updated;
  });
  return NextResponse.json({ ok: true, item: { ...item, quantity: Number(item.quantity), lowStockThreshold: item.lowStockThreshold === null ? null : Number(item.lowStockThreshold) } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
  const { id } = await params;
  const confirmation = requireSunjaeDeleteConfirmation(req, actor, "inventory", id);
  if (confirmation) return confirmation;
  await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.delete({ where: { id } });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "inventory.delete",
      targetType: "inventory_item",
      targetId: id,
      responseJson: { id },
      ok: true,
    });
  });
  return NextResponse.json({ ok: true });
}
