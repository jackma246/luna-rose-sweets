import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, CATEGORY_CHIP, EXPENSE_CATEGORIES } from "@/lib/expenseCategories";
import { lastNMonthOptions, parseMonth } from "@/lib/monthFilter";
import type { ExpenseCategory, Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

interface SearchParams {
  month?: string;
  category?: string;
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const monthRange = parseMonth(sp.month);
  const categoryFilter = sp.category && EXPENSE_CATEGORIES.includes(sp.category as ExpenseCategory)
    ? (sp.category as ExpenseCategory)
    : null;

  const filtersActive = Boolean(monthRange) || Boolean(categoryFilter);

  const where: Prisma.ExpenseWhereInput = {};
  if (monthRange) where.date = { gte: monthRange.start, lt: monthRange.end };
  if (categoryFilter) where.category = categoryFilter;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    take: filtersActive ? 1000 : 200,
  });

  // Summary card data
  const summaryRange = monthRange ?? (() => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  })();
  const summaryLabel = monthRange
    ? new Date(summaryRange.start).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "This month";

  // Pull summary expenses separately when filters cut the visible list down,
  // so the card always reflects the chosen month regardless of category filter.
  const summaryExpenses = await prisma.expense.findMany({
    where: { date: { gte: summaryRange.start, lt: summaryRange.end } },
  });
  const summaryTotal = summaryExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = summaryExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const monthOptions = lastNMonthOptions(12);
  const selectCls =
    "border border-neutral-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300";

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

      <form method="get" className="flex flex-wrap items-center gap-2 mb-5">
        <select name="month" defaultValue={sp.month || "all"} className={selectCls}>
          <option value="all">All months</option>
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select name="category" defaultValue={sp.category || "all"} className={selectCls}>
          <option value="all">All categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-medium px-4 py-2 rounded-full">
          Apply
        </button>
        {filtersActive && (
          <Link href="/admin/expenses" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
            Clear
          </Link>
        )}
      </form>

      <section className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          {summaryLabel}
        </div>
        <div className="text-2xl font-semibold mb-3">${summaryTotal.toFixed(2)}</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byCategory).length === 0 ? (
            <span className="text-sm text-neutral-400">No expenses for this period.</span>
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
        {filtersActive ? "Matching" : "Recent"} · {expenses.length}
      </h2>
      {expenses.length === 0 ? (
        <p className="text-sm text-neutral-400 px-1">
          {filtersActive ? "No expenses match these filters." : "No expenses logged yet."}
        </p>
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
