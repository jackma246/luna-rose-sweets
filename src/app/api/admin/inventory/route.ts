import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INVENTORY_CATEGORIES } from "@/lib/inventoryCategories";
import type { InventoryCategory } from "@/generated/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function GET(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const items = await prisma.inventoryItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }], take: 1000 });
  return NextResponse.json({
    ok: true,
    items: items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      lowStockThreshold: item.lowStockThreshold === null ? null : Number(item.lowStockThreshold),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

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

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.inventoryItem.create({
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

    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "inventory.create",
      targetType: "inventory_item",
      targetId: created.id,
      requestJson: body,
      responseJson: { id: created.id },
      ok: true,
    });

    return created;
  });

  return NextResponse.json({ ok: true, id: item.id });
}
