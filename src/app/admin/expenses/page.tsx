import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, CATEGORY_CHIP } from "@/lib/expenseCategories";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" }, take: 200 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTotal = expenses
    .filter((e) => e.date >= monthStart)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = expenses
    .filter((e) => e.date >= monthStart)
    .reduce<Record<string, number>>((acc, e) => {
      const k = e.category;
      acc[k] = (acc[k] || 0) + Number(e.amount);
      return acc;
    }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Link
          href="/admin/expenses/new"
          className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-full"
        >
          + New
        </Link>
      </div>

      <section className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          This month
        </div>
        <div className="text-2xl font-semibold mb-3">${monthTotal.toFixed(2)}</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byCategory).length === 0 ? (
            <span className="text-sm text-neutral-400">No expenses yet.</span>
          ) : (
            Object.entries(byCategory).map(([cat, amt]) => (
              <span
                key={cat}
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  CATEGORY_CHIP[cat as keyof typeof CATEGORY_CHIP]
                }`}
              >
                {CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]} ${amt.toFixed(2)}
              </span>
            ))
          )}
        </div>
      </section>

      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5 px-1">
        Recent · {expenses.length}
      </h2>
      {expenses.length === 0 ? (
        <p className="text-sm text-neutral-400 px-1">No expenses logged yet.</p>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((e) => (
            <Link
              key={e.id}
              href={`/admin/expenses/${e.id}`}
              className="block bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 active:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.vendor}</div>
                  <div className="text-xs text-neutral-500">
                    {new Date(e.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_CHIP[e.category]}`}>
                  {CATEGORY_LABEL[e.category]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                {e.notes && <span className="text-xs text-neutral-500 truncate mr-3">{e.notes}</span>}
                <span className="font-medium ml-auto">${Number(e.amount).toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
