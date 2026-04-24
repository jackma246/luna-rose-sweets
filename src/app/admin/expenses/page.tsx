import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, CATEGORY_CHIP, EXPENSE_CATEGORIES } from "@/lib/expenseCategories";
import { lastNMonthOptions, parseMonth } from "@/lib/monthFilter";
import { FilterChips, FilterSelect } from "../FilterChips";
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

  const summaryRange = monthRange ?? (() => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  })();
  const summaryLabel = monthRange
    ? new Date(summaryRange.start).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "This month";

  const summaryExpenses = await prisma.expense.findMany({
    where: { date: { gte: summaryRange.start, lt: summaryRange.end } },
  });
  const summaryTotal = summaryExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = summaryExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const monthOptions = lastNMonthOptions(12);
  const categoryChipOptions = [
    { value: "all", label: "All" },
    ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="kicker mb-2">Expenses</div>
          <h1 className="text-4xl italic font-light leading-none">
            Tracking <span className="font-medium">spend</span>
          </h1>
        </div>
        <Link href="/admin/expenses/new" className="btn-cherry">
          + New expense
        </Link>
      </div>

      <div className="admin-card-soft p-4 mb-6 space-y-3">
        <FilterChips param="category" options={categoryChipOptions} current={sp.category} />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="kicker">Month</span>
          <FilterSelect param="month" options={monthOptions} current={sp.month} placeholder="All months" />
          {filtersActive && (
            <Link href="/admin/expenses" className="text-xs text-ink-soft hover:text-ink underline ml-auto">
              Clear filters
            </Link>
          )}
        </div>
      </div>

      <section className="admin-card p-6 mb-6">
        <div className="kicker mb-2">{summaryLabel}</div>
        <div className="text-4xl font-medium text-ink mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
          ${summaryTotal.toFixed(2)}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byCategory).length === 0 ? (
            <span className="text-sm text-ink-soft">No expenses for this period.</span>
          ) : (
            Object.entries(byCategory).map(([cat, amt]) => (
              <span
                key={cat}
                className={`pill ${CATEGORY_CHIP[cat as keyof typeof CATEGORY_CHIP]}`}
              >
                {CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]} ${amt.toFixed(2)}
              </span>
            ))
          )}
        </div>
      </section>

      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="section-title">{filtersActive ? "Matching" : "Recent"}</h2>
        <span className="text-xs text-ink-soft">{expenses.length}</span>
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-ink-soft px-1">
          {filtersActive ? "No expenses match these filters." : "No expenses logged yet."}
        </p>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((e) => (
            <Link key={e.id} href={`/admin/expenses/${e.id}`} className="row-link">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-ink truncate">{e.vendor}</div>
                  <div className="text-xs text-ink-soft">
                    {new Date(e.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <span className={`pill shrink-0 ${CATEGORY_CHIP[e.category]}`}>{CATEGORY_LABEL[e.category]}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--rule)]">
                {e.notes && <span className="text-xs text-ink-soft truncate mr-3">{e.notes}</span>}
                <span className="font-medium ml-auto text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
                  ${Number(e.amount).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
