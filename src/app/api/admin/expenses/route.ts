import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";
import type { ExpenseCategory } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    date: string;
    amount: number;
    vendor: string;
    category: ExpenseCategory;
    notes?: string;
    receiptUrl?: string;
  };

  if (!body.date || !body.vendor || body.amount === undefined || body.amount === null) {
    return NextResponse.json({ ok: false, error: "Date, vendor, amount required." }, { status: 400 });
  }
  if (!EXPENSE_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ ok: false, error: "Invalid category." }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      date: new Date(body.date + "T00:00:00"),
      amount: body.amount,
      vendor: body.vendor,
      category: body.category,
      notes: body.notes || null,
      receiptUrl: body.receiptUrl || null,
    },
  });

  return NextResponse.json({ ok: true, id: expense.id });
}
