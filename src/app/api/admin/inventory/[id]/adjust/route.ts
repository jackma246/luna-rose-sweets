import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: { quantity: next },
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
