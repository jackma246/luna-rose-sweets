import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import type { OrderStatus } from "@/generated/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as {
    status?: OrderStatus;
    internalNotes?: string | null;
    neededDate?: string | null;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string | null;
    totalPrice?: number;
  };

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes;
  if (body.neededDate !== undefined) {
    data.neededDate = body.neededDate ? new Date(body.neededDate + "T00:00:00") : null;
  }
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
  if (body.totalPrice !== undefined) data.totalPrice = body.totalPrice;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json({ ok: true, order });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
