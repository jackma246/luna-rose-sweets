import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, STATUS_CHIP, daysUntil, daysUntilLabel, isTerminal } from "@/lib/orderStatus";
import type { Order } from "@/generated/prisma";

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
          <div className="font-medium truncate">{order.customerName}</div>
          <div className="text-sm text-neutral-500 truncate">{order.customerEmail}</div>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CHIP[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
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

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: [{ neededDate: "asc" }, { createdAt: "desc" }],
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const active = orders.filter((o) => !isTerminal(o.status));
  const dueThisWeek = active.filter((o) => o.neededDate && o.neededDate <= weekEnd);
  const later = active.filter((o) => !o.neededDate || o.neededDate > weekEnd);
  const finished = orders.filter((o) => isTerminal(o.status)).slice(0, 20);

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

      <Section title="Due this week" orders={dueThisWeek} empty="Nothing scheduled in the next 7 days." />
      <Section title="Later" orders={later} empty="No future orders yet." />
      <Section title="Recently completed / cancelled" orders={finished} empty="No finished orders yet." />
    </div>
  );
}
