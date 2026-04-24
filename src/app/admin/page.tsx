import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_CHIP, daysUntil, daysUntilLabel, isTerminal } from "@/lib/orderStatus";
import { ORDER_SOURCES, SOURCE_LABEL, SOURCE_CHIP } from "@/lib/orderSources";
import { formatOrderNumber } from "@/lib/orderNumber";
import { lastNMonthOptions, parseMonth } from "@/lib/monthFilter";
import { FilterChips, FilterSelect } from "./FilterChips";
import type { Order, OrderSource, Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

function OrderCard({ order }: { order: Order }) {
  const days = daysUntil(order.neededDate);
  const overdue = days !== null && days < 0 && !isTerminal(order.status);
  const soon = days !== null && days >= 0 && days <= 3 && !isTerminal(order.status);

  return (
    <Link href={`/admin/orders/${order.id}`} className="row-link">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="kicker mb-1">{formatOrderNumber(order.orderNumber)}</div>
          <div className="text-[15px] font-semibold text-ink truncate">{order.customerName}</div>
          <div className="text-sm text-ink-soft truncate">{order.customerEmail}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`pill ${STATUS_CHIP[order.status]}`}>{STATUS_LABEL[order.status]}</span>
          <span className={`pill ${SOURCE_CHIP[order.source]}`}>{SOURCE_LABEL[order.source]}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--rule)]">
        <span
          className={`${
            overdue ? "text-[#b91c1c] font-semibold" : soon ? "text-rose-deep font-semibold" : "text-ink-soft"
          }`}
        >
          {order.neededDate
            ? new Date(order.neededDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "No date"}
          <span className="mx-2 text-[var(--rule)]">·</span>
          {daysUntilLabel(days)}
        </span>
        <span className="font-serif text-lg font-medium text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
          ${Number(order.totalPrice).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}

function Section({ title, orders, empty }: { title: string; orders: Order[]; empty?: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="section-title">{title}</h2>
        {orders.length > 0 && <span className="text-xs text-ink-soft">{orders.length}</span>}
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-ink-soft px-1 py-3">{empty || "Nothing here."}</p>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}

interface SearchParams {
  month?: string;
  source?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const monthRange = parseMonth(sp.month);
  const sourceFilter = sp.source && ORDER_SOURCES.includes(sp.source as OrderSource)
    ? (sp.source as OrderSource)
    : null;

  const filtersActive = Boolean(monthRange) || Boolean(sourceFilter);

  const where: Prisma.OrderWhereInput = {};
  if (monthRange) where.neededDate = { gte: monthRange.start, lt: monthRange.end };
  if (sourceFilter) where.source = sourceFilter;

  const orders = await prisma.order.findMany({
    where,
    orderBy: filtersActive
      ? [{ neededDate: "desc" }, { createdAt: "desc" }]
      : [{ neededDate: "asc" }, { createdAt: "desc" }],
  });

  const monthOptions = lastNMonthOptions(12);

  let totalForFiltered = 0;
  if (filtersActive) {
    totalForFiltered = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.totalPrice), 0);
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const active = orders.filter((o) => !isTerminal(o.status));
  const dueThisWeek = active.filter((o) => o.neededDate && o.neededDate <= weekEnd);
  const later = active.filter((o) => !o.neededDate || o.neededDate > weekEnd);
  const finished = orders.filter((o) => isTerminal(o.status)).slice(0, 20);

  const sourceChipOptions = [
    { value: "all", label: "All sources" },
    ...ORDER_SOURCES.map((s) => ({ value: s, label: SOURCE_LABEL[s] })),
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="kicker mb-2">Orders</div>
          <h1 className="text-4xl italic font-light leading-none">
            All <span className="font-medium">orders</span>
          </h1>
        </div>
        <Link href="/admin/orders/new" className="btn-cherry">
          + New order
        </Link>
      </div>

      <div className="admin-card-soft p-4 mb-6 space-y-3">
        <FilterChips param="source" options={sourceChipOptions} current={sp.source} />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="kicker">Month</span>
          <FilterSelect param="month" options={monthOptions} current={sp.month} placeholder="All months" />
          {filtersActive && (
            <Link href="/admin" className="text-xs text-ink-soft hover:text-ink underline ml-auto">
              Clear filters
            </Link>
          )}
        </div>
      </div>

      {filtersActive ? (
        <>
          <div className="admin-card p-5 mb-5 flex items-center justify-between">
            <div className="text-sm text-ink-soft">
              <span className="text-2xl font-medium text-ink mr-1" style={{ fontFamily: "var(--font-fraunces)" }}>
                {orders.length}
              </span>
              order{orders.length === 1 ? "" : "s"} matched
            </div>
            <div className="text-2xl font-medium text-cherry" style={{ fontFamily: "var(--font-fraunces)" }}>
              ${totalForFiltered.toFixed(2)}
            </div>
          </div>
          <Section title="Filtered" orders={orders} empty="No orders match these filters." />
        </>
      ) : (
        <>
          <Section title="Due this week" orders={dueThisWeek} empty="Nothing scheduled in the next 7 days." />
          <Section title="Later" orders={later} empty="No future orders yet." />
          <Section title="Recently completed / cancelled" orders={finished} empty="No finished orders yet." />
        </>
      )}
    </div>
  );
}
