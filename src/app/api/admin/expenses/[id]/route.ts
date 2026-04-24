import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";
import type { ExpenseCategory } from "@/generated/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as {
    date?: string;
    amount?: number;
    vendor?: string;
    category?: ExpenseCategory;
    notes?: string | null;
    receiptUrl?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.date !== undefined) data.date = new Date(body.date + "T00:00:00");
  if (body.amount !== undefined) data.amount = body.amount;
  if (body.vendor !== undefined) data.vendor = body.vendor;
  if (body.category !== undefined) {
    if (!EXPENSE_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ ok: false, error: "Invalid category." }, { status: 400 });
    }
    data.category = body.category;
  }
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.receiptUrl !== undefined) data.receiptUrl = body.receiptUrl;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const expense = await prisma.expense.update({ where: { id }, data });
  return NextResponse.json({ ok: true, expense });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
