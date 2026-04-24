import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_CHIP, daysUntil, daysUntilLabel, isTerminal } from "@/lib/orderStatus";
import { ORDER_SOURCES, SOURCE_LABEL, SOURCE_CHIP } from "@/lib/orderSources";
import { formatOrderNumber } from "@/lib/orderNumber";
import { lastNMonthOptions, parseMonth } from "@/lib/monthFilter";
import type { Order, OrderSource, Prisma } from "@/generated/prisma";

export const dynamic = "force-dynamic";

function OrderCard({ order }: { order: Order }) {
  const days = daysUntil(order.neededDate);
  const overdue = days !== null && days < 0 && !isTerminal(order.status);
  const soon = days !== null && days >= 0 && days <= 3 && !isTerminal(order.status);

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 active:bg-neutral-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-wider text-rose-600 mb-0.5">
            {formatOrderNumber(order.orderNumber)}
          </div>
          <div className="font-medium truncate">{order.customerName}</div>
          <div className="text-sm text-neutral-500 truncate">{order.customerEmail}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CHIP[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${SOURCE_CHIP[order.source]}`}>
            {SOURCE_LABEL[order.source]}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span
          className={`${
            overdue ? "text-red-600 font-medium" : soon ? "text-amber-700 font-medium" : "text-neutral-600"
          }`}
        >
          {order.neededDate
            ? new Date(order.neededDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "No date"}
          <span className="mx-1.5 text-neutral-400">·</span>
          {daysUntilLabel(days)}
        </span>
        <span className="font-medium">${Number(order.totalPrice).toFixed(2)}</span>
      </div>
    </Link>
  );
}

function Section({ title, orders, empty }: { title: string; orders: Order[]; empty?: string }) {
  return (
    <section className="mb-7">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2.5 px-1">
        {title} {orders.length > 0 && <span className="text-neutral-400">· {orders.length}</span>}
      </h2>
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-400 px-1 py-3">{empty || "Nothing here."}</p>
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
      .filter((o) => !isTerminal(o.status) || o.status === "completed" || o.status === "delivered")
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.totalPrice), 0);
  }

  // Unfiltered grouping
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const active = orders.filter((o) => !isTerminal(o.status));
  const dueThisWeek = active.filter((o) => o.neededDate && o.neededDate <= weekEnd);
  const later = active.filter((o) => !o.neededDate || o.neededDate > weekEnd);
  const finished = orders.filter((o) => isTerminal(o.status)).slice(0, 20);

  const selectCls =
    "border border-neutral-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link
          href="/admin/orders/new"
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
        <select name="source" defaultValue={sp.source || "all"} className={selectCls}>
          <option value="all">All sources</option>
          {ORDER_SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-medium px-4 py-2 rounded-full">
          Apply
        </button>
        {filtersActive && (
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
            Clear
          </Link>
        )}
      </form>

      {filtersActive ? (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5 flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">{orders.length}</span> order{orders.length === 1 ? "" : "s"} matched
            </div>
            <div className="text-lg font-semibold">${totalForFiltered.toFixed(2)}</div>
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
