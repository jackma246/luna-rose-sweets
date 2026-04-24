import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpenseEditor from "./ExpenseEditor";

export const dynamic = "force-dynamic";

export default async function ExpenseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) notFound();

  const serialized = {
    ...expense,
    amount: Number(expense.amount),
    date: expense.date.toISOString().slice(0, 10),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };

  return (
    <div>
      <Link href="/admin/expenses" className="text-[12px] tracking-[0.2em] uppercase text-ink-soft hover:text-cherry mb-4 inline-block">
        ← All expenses
      </Link>
      <ExpenseEditor expense={serialized} />
    </div>
  );
}
