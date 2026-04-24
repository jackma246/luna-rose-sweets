import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { ORDER_SOURCES } from "@/lib/orderSources";
import type { OrderStatus, OrderSource } from "@/generated/prisma";

interface NewOrderItem {
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: NewOrderItem[];
    totalPrice: number;
    neededDate?: string;
    customerNotes?: string;
    internalNotes?: string;
    status?: OrderStatus;
    source?: OrderSource;
  };

  if (!body.customerName || !body.customerEmail) {
    return NextResponse.json({ ok: false, error: "Name and email required." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, error: "At least one item required." }, { status: 400 });
  }
  const status: OrderStatus = body.status && ORDER_STATUSES.includes(body.status) ? body.status : "pending";
  const source: OrderSource = body.source && ORDER_SOURCES.includes(body.source) ? body.source : "website";

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || null,
      items: body.items as unknown as object[],
      totalPrice: body.totalPrice,
      neededDate: body.neededDate ? new Date(body.neededDate + "T00:00:00") : null,
      customerNotes: body.customerNotes || null,
      internalNotes: body.internalNotes || null,
      status,
      source,
    },
  });

  return NextResponse.json({ ok: true, id: order.id });
}
