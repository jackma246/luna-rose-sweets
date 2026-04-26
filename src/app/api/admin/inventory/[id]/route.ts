import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INVENTORY_CATEGORIES } from "@/lib/inventoryCategories";
import type { InventoryCategory } from "@/generated/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const item = await prisma.inventoryItem.update({ where: { id }, data });
  return NextResponse.json({ ok: true, item: { ...item, quantity: Number(item.quantity), lowStockThreshold: item.lowStockThreshold === null ? null : Number(item.lowStockThreshold) } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
