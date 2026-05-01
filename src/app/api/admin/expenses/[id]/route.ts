import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";
import type { ExpenseCategory } from "@/generated/prisma";
import { isAuthResponse, requireAdmin, requireSunjaeDeleteConfirmation } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const { id } = await params;
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    expense: {
      ...expense,
      amount: Number(expense.amount),
      date: expense.date.toISOString().slice(0, 10),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
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

  const expense = await prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({ where: { id }, data });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "expense.patch",
      targetType: "expense",
      targetId: id,
      requestJson: body,
      responseJson: { id },
      ok: true,
    });
    return updated;
  });
  return NextResponse.json({ ok: true, expense });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;
  const { id } = await params;
  const confirmation = requireSunjaeDeleteConfirmation(req, actor, "expense", id);
  if (confirmation) return confirmation;
  await prisma.$transaction(async (tx) => {
    await tx.expense.delete({ where: { id } });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "expense.delete",
      targetType: "expense",
      targetId: id,
      responseJson: { id },
      ok: true,
    });
  });
  return NextResponse.json({ ok: true });
}
