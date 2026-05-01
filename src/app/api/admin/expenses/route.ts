import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";
import type { ExpenseCategory } from "@/generated/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function GET(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" }, take: 500 });
  return NextResponse.json({
    ok: true,
    expenses: expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      date: expense.date.toISOString().slice(0, 10),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

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

  const expense = await prisma.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: {
        date: new Date(body.date + "T00:00:00"),
        amount: body.amount,
        vendor: body.vendor,
        category: body.category,
        notes: body.notes || null,
        receiptUrl: body.receiptUrl || null,
      },
    });

    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "expense.create",
      targetType: "expense",
      targetId: created.id,
      requestJson: body,
      responseJson: { id: created.id },
      ok: true,
    });

    return created;
  });

  return NextResponse.json({ ok: true, id: expense.id });
}
