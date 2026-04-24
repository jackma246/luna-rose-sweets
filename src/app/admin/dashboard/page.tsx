import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SOURCE_LABEL } from "@/lib/orderSources";
import { CATEGORY_LABEL } from "@/lib/expenseCategories";
import { MonthlyBars, NetBars, SlicePie } from "./Charts";
import type { MonthlyPoint, SlicePoint } from "./Charts";
import { isTerminal } from "@/lib/orderStatus";
import type { OrderSource, ExpenseCategory } from "@/generated/prisma";

export const dynamic = "force-dynamic";

type Range = "30d" | "this_month" | "last_month" | "ytd" | "12m";
const VALID_RANGES: Range[] = ["30d", "this_month", "last_month", "ytd", "12m"];
const RANGE_LABEL: Record<Range, string> = {
  "30d": "Last 30 days",
  this_month: "This month",
  last_month: "Last month",
  ytd: "Year to date",
  "12m": "Last 12 months",
};

function rangeBounds(range: Range): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  if (range === "30d") {
    const start = new Date(end);
    start.setDate(start.getDate() - 30);
    return { start, end };
  }
  if (range === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  }
  if (range === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: e };
  }
  if (range === "ytd") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end };
  }
  // 12m
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  return { start, end };
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function buildMonthlyBuckets(start: Date, end: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    out.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

interface SearchParams {
  range?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const range: Range = VALID_RANGES.includes(sp.range as Range) ? (sp.range as Range) : "12m";
  const { start, end } = rangeBounds(range);

  // Fetch orders + expenses for the window. Revenue attributed by createdAt.
  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        status: { not: "cancelled" },
      },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
    }),
  ]);

  // Monthly buckets
  const buckets = buildMonthlyBuckets(start, new Date(end.getTime() - 1));
  const revenueByMonth: Record<string, number> = Object.fromEntries(buckets.map((k) => [k, 0]));
  const expensesByMonth: Record<string, number> = Object.fromEntries(buckets.map((k) => [k, 0]));

  for (const o of orders) {
    const k = monthKey(new Date(o.createdAt));
    if (k in revenueByMonth) revenueByMonth[k] += Number(o.totalPrice);
  }
  for (const e of expenses) {
    const k = monthKey(new Date(e.date));
    if (k in expensesByMonth) expensesByMonth[k] += Number(e.amount);
  }

  const monthly: MonthlyPoint[] = buckets.map((k) => ({
    month: monthLabel(k),
    revenue: Number(revenueByMonth[k].toFixed(2)),
    expenses: Number(expensesByMonth[k].toFixed(2)),
    net: Number((revenueByMonth[k] - expensesByMonth[k]).toFixed(2)),
  }));

  // Source breakdown
  const sourceTotals = new Map<OrderSource, number>();
  for (const o of orders) {
    sourceTotals.set(o.source, (sourceTotals.get(o.source) || 0) + Number(o.totalPrice));
  }
  const sourceData: SlicePoint[] = Array.from(sourceTotals.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([s, v]) => ({ name: SOURCE_LABEL[s], value: Number(v.toFixed(2)) }));

  // Expense category breakdown
  const categoryTotals = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + Number(e.amount));
  }
  const categoryData: SlicePoint[] = Array.from(categoryTotals.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => ({ name: CATEGORY_LABEL[c], value: Number(v.toFixed(2)) }));

  // Headline tiles use the selected window
  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const net = totalRevenue - totalExpenses;

  // Active orders is independent of the date filter — always reflects "right now"
  const allOrders = await prisma.order.findMany({ select: { status: true } });
  const activeCount = allOrders.filter((o) => !isTerminal(o.status)).length;

  const selectCls =
    "border border-neutral-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <select name="range" defaultValue={range} className={selectCls}>
          {VALID_RANGES.map((r) => (
            <option key={r} value={r}>
              {RANGE_LABEL[r]}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-medium px-4 py-2 rounded-full">
          Apply
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Revenue" value={`$${totalRevenue.toFixed(2)}`} sub={RANGE_LABEL[range]} accent="rose" />
        <Tile label="Expenses" value={`$${totalExpenses.toFixed(2)}`} sub={RANGE_LABEL[range]} accent="mint" />
        <Tile label="Net" value={`$${net.toFixed(2)}`} sub="Revenue − expenses" accent={net >= 0 ? "choc" : "red"} />
        <Tile label="Active orders" value={String(activeCount)} sub="Right now" accent="neutral" />
      </div>

      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Revenue vs expenses
          </h2>
          <Link href="/admin" className="text-xs text-neutral-500 hover:text-neutral-900">View orders →</Link>
        </div>
        <MonthlyBars data={monthly} />
      </section>

      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Net by month
        </h2>
        <NetBars data={monthly} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            Revenue by source
          </h2>
          <SlicePie data={sourceData} />
        </section>
        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            Expenses by category
          </h2>
          <SlicePie data={categoryData} />
        </section>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "rose" | "mint" | "choc" | "red" | "neutral";
}) {
  const accentBar: Record<typeof accent, string> = {
    rose: "bg-rose-500",
    mint: "bg-[#A8D8CB]",
    choc: "bg-[#5C3828]",
    red: "bg-red-500",
    neutral: "bg-neutral-400",
  };
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar[accent]}`} />
      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-neutral-400 mt-1">{sub}</div>
    </div>
  );
}
