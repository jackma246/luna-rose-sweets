import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SOURCE_LABEL } from "@/lib/orderSources";
import { CATEGORY_LABEL } from "@/lib/expenseCategories";
import { DayOfWeekBars, MonthlyBars, NetBars, OrdersBars, SlicePie } from "./Charts";
import type { DayOfWeekPoint, MonthlyPoint, SlicePoint } from "./Charts";
import { isTerminal, daysUntil } from "@/lib/orderStatus";
import { FilterChips } from "../FilterChips";
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

function itemSummary(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  const first = items[0] as { name?: string };
  const name = first?.name ?? "Item";
  const extra = items.length - 1;
  return extra > 0 ? `${name} +${extra} more` : name;
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

  const buckets = buildMonthlyBuckets(start, new Date(end.getTime() - 1));
  const revenueByMonth: Record<string, number> = Object.fromEntries(buckets.map((k) => [k, 0]));
  const expensesByMonth: Record<string, number> = Object.fromEntries(buckets.map((k) => [k, 0]));
  const ordersByMonth: Record<string, number> = Object.fromEntries(buckets.map((k) => [k, 0]));

  for (const o of orders) {
    const k = monthKey(new Date(o.createdAt));
    if (k in revenueByMonth) {
      revenueByMonth[k] += Number(o.totalPrice);
      ordersByMonth[k] += 1;
    }
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
    orders: ordersByMonth[k],
  }));

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const placedByDow = [0, 0, 0, 0, 0, 0, 0];
  const neededByDow = [0, 0, 0, 0, 0, 0, 0];
  for (const o of orders) {
    placedByDow[new Date(o.createdAt).getDay()] += 1;
    if (o.neededDate) neededByDow[new Date(o.neededDate).getUTCDay()] += 1;
  }
  const dayOfWeek: DayOfWeekPoint[] = DAY_LABELS.map((day, i) => ({
    day,
    placed: placedByDow[i],
    needed: neededByDow[i],
  }));

  const sourceTotals = new Map<OrderSource, number>();
  for (const o of orders) {
    sourceTotals.set(o.source, (sourceTotals.get(o.source) || 0) + Number(o.totalPrice));
  }
  const sourceData: SlicePoint[] = Array.from(sourceTotals.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([s, v]) => ({ name: SOURCE_LABEL[s], value: Number(v.toFixed(2)) }));

  const categoryTotals = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + Number(e.amount));
  }
  const categoryData: SlicePoint[] = Array.from(categoryTotals.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => ({ name: CATEGORY_LABEL[c], value: Number(v.toFixed(2)) }));

  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const net = totalRevenue - totalExpenses;
  const orderCount = orders.length;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  const allOrders = await prisma.order.findMany({ select: { status: true } });
  const activeCount = allOrders.filter((o) => !isTerminal(o.status)).length;

  // "Coming up this week" — active, dated orders due within 7 days (incl. overdue)
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekOrders = await prisma.order.findMany({
    where: { neededDate: { lte: weekEnd }, status: { not: "cancelled" } },
    orderBy: [{ neededDate: "asc" }],
  });
  const upcoming = weekOrders.filter((o) => !isTerminal(o.status));
  const upcomingTotal = upcoming.reduce((s, o) => s + Number(o.totalPrice), 0);
  const next3 = upcoming.slice(0, 3);

  const rangeOptions = VALID_RANGES.map((r) => ({ value: r, label: RANGE_LABEL[r] }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="kicker mb-2">Dashboard</div>
          <h1 className="text-4xl italic font-light leading-none">
            How the <span className="font-medium">shop</span> is doing
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/orders/new" className="btn-cherry">+ New order</Link>
          <Link href="/admin/expenses/new" className="btn-ghost">+ Add expense</Link>
          <Link href="/admin/availability" className="btn-ghost">Availability</Link>
        </div>
      </div>

      {next3.length > 0 ? (
        <section className="admin-card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="section-title">Coming up this week</h2>
            <span className="text-xs text-ink-soft">
              {upcoming.length} due this week ·{" "}
              <span className="text-ink font-medium">${upcomingTotal.toFixed(2)}</span>
            </span>
          </div>
          <div className="space-y-2">
            {next3.map((o) => {
              const days = daysUntil(o.neededDate);
              const overdue = days !== null && days < 0;
              const soon = days !== null && days >= 0 && days <= 3;
              const chip = overdue
                ? { background: "var(--rose-deep)", color: "#fff" }
                : soon
                  ? { background: "var(--butter)", color: "var(--ink)" }
                  : { background: "var(--paper-deep)", color: "var(--ink-soft)" };
              return (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--rule)] bg-paper px-4 py-3 hover:border-ink transition-colors"
                >
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                    style={chip}
                  >
                    {o.neededDate
                      ? new Date(o.neededDate).toLocaleDateString("en-US", { weekday: "short" })
                      : "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink truncate">{o.customerName}</div>
                    <div className="text-xs text-ink-soft truncate">{itemSummary(o.items)}</div>
                  </div>
                  <span className="shrink-0 font-medium text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
                    ${Number(o.totalPrice).toFixed(2)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="admin-card p-5">
          <h2 className="section-title mb-1">Coming up this week</h2>
          <p className="text-sm text-ink-soft">A clear week ahead — nothing due in the next 7 days.</p>
        </section>
      )}

      <div className="admin-card-soft p-4">
        <FilterChips param="range" options={rangeOptions} current={range} variant="cherry" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Revenue" value={`$${totalRevenue.toFixed(2)}`} sub={RANGE_LABEL[range]} accent="cherry" />
        <Tile label="Orders" value={String(orderCount)} sub={`Avg $${avgOrder.toFixed(2)} · ${activeCount} active`} accent="ink" />
        <Tile label="Expenses" value={`$${totalExpenses.toFixed(2)}`} sub={RANGE_LABEL[range]} accent="mint" />
        <Tile label="Net" value={`${net >= 0 ? "+" : "−"}$${Math.abs(net).toFixed(2)}`} sub="Revenue − expenses" accent={net >= 0 ? "pine" : "rose"} />
      </div>

      <section className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Revenue vs expenses</h2>
          <Link href="/admin" className="text-[11px] tracking-[0.18em] uppercase text-ink-soft hover:text-cherry">
            View orders →
          </Link>
        </div>
        <MonthlyBars data={monthly} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="admin-card p-6">
          <h2 className="section-title mb-4">Orders per month</h2>
          <OrdersBars data={monthly} />
        </section>
        <section className="admin-card p-6">
          <h2 className="section-title mb-4">Net by month</h2>
          <NetBars data={monthly} />
        </section>
      </div>

      <section className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Orders by day of week</h2>
          <span className="text-[11px] tracking-[0.18em] uppercase text-ink-soft">Placed vs needed</span>
        </div>
        <DayOfWeekBars data={dayOfWeek} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="admin-card p-6">
          <h2 className="section-title mb-4">Revenue by source</h2>
          <SlicePie data={sourceData} />
        </section>
        <section className="admin-card p-6">
          <h2 className="section-title mb-4">Expenses by category</h2>
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
  accent: "cherry" | "mint" | "ink" | "rose" | "pine";
}) {
  const accentBar: Record<typeof accent, string> = {
    cherry: "bg-cherry",
    mint: "bg-[#9FC8B8]",
    ink: "bg-ink",
    rose: "bg-rose-deep",
    pine: "bg-[#5E8A6E]",
  };
  const isPine = accent === "pine";
  return (
    <div className="admin-card p-5 relative overflow-hidden" style={isPine ? { background: "#f3f8f4" } : undefined}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar[accent]}`} />
      <div className="kicker mb-2">{label}</div>
      <div className="text-3xl font-medium leading-none" style={{ fontFamily: "var(--font-fraunces)", color: isPine ? "#3f6b54" : "var(--ink)" }}>
        {value}
      </div>
      <div className="text-xs text-ink-soft mt-2">{sub}</div>
    </div>
  );
}
