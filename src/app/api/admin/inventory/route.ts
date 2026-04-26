import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INVENTORY_CATEGORIES } from "@/lib/inventoryCategories";
import type { InventoryCategory } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    name: string;
    quantity: number;
    unit?: string;
    category: InventoryCategory;
    lowStockThreshold?: number | null;
    notes?: string;
  };

  if (!body.name || body.quantity === undefined || body.quantity === null) {
    return NextResponse.json({ ok: false, error: "Name and quantity required." }, { status: 400 });
  }
  if (!INVENTORY_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ ok: false, error: "Invalid category." }, { status: 400 });
  }
  if (body.quantity < 0) {
    return NextResponse.json({ ok: false, error: "Quantity can't be negative." }, { status: 400 });
  }

  const item = await prisma.inventoryItem.create({
    data: {
      name: body.name.trim(),
      quantity: body.quantity,
      unit: body.unit?.trim() || null,
      category: body.category,
      lowStockThreshold:
        body.lowStockThreshold === null || body.lowStockThreshold === undefined
          ? null
          : body.lowStockThreshold,
      notes: body.notes?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, id: item.id });
}
