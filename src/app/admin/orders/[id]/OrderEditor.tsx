"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, STATUS_LABEL, STATUS_CHIP } from "@/lib/orderStatus";
import type { OrderStatus } from "@/generated/prisma";

interface CartItem {
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
}

interface SerializedOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  items: unknown;
  totalPrice: number;
  neededDate: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  status: OrderStatus;
  remindersSent: string[];
  createdAt: string;
  updatedAt: string;
}

export default function OrderEditor({ order }: { order: SerializedOrder }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || "");
  const [neededDate, setNeededDate] = useState(order.neededDate || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const items = (Array.isArray(order.items) ? order.items : []) as CartItem[];

  async function save(fields: Record<string, unknown>) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    } catch {
      alert("Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: OrderStatus) {
    setStatus(newStatus);
    await save({ status: newStatus });
  }

  async function handleNotesBlur() {
    if (internalNotes === (order.internalNotes || "")) return;
    await save({ internalNotes: internalNotes || null });
  }

  async function handleDateChange(newDate: string) {
    setNeededDate(newDate);
    await save({ neededDate: newDate || null });
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      window.location.assign("/admin");
    } catch {
      alert("Couldn't delete — try again.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-semibold">{order.customerName}</h1>
            <a
              href={`mailto:${order.customerEmail}`}
              className="text-sm text-rose-600 hover:underline block mt-0.5"
            >
              {order.customerEmail}
            </a>
            {order.customerPhone && (
              <a
                href={`tel:${order.customerPhone}`}
                className="text-sm text-neutral-600 hover:underline block"
              >
                {order.customerPhone}
              </a>
            )}
          </div>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CHIP[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div className="text-xs text-neutral-500">
          Received {new Date(order.createdAt).toLocaleString()}
        </div>
      </header>

      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">Status</h2>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={saving}
          className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {saved && <p className="text-xs text-emerald-600 mt-2">Saved ✓</p>}
      </section>

      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Needed by
        </h2>
        <input
          type="date"
          value={neededDate}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={saving}
          className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </section>

      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Items · ${Number(order.totalPrice).toFixed(2)}
        </h2>
        <ul className="divide-y divide-neutral-100">
          {items.map((item, idx) => (
            <li key={idx} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  {item.variantLabel && (
                    <div className="text-neutral-500 text-xs">{item.variantLabel}</div>
                  )}
                  {item.flavour && (
                    <div className="text-neutral-500 text-xs">Flavour: {item.flavour}</div>
                  )}
                  {item.note && (
                    <div className="text-neutral-500 text-xs whitespace-pre-wrap">Note: {item.note}</div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div>×{item.quantity}</div>
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {order.customerNotes && (
        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Customer notes
          </h2>
          <p className="text-sm whitespace-pre-wrap">{order.customerNotes}</p>
        </section>
      )}

      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Internal notes
        </h2>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          onBlur={handleNotesBlur}
          disabled={saving}
          rows={4}
          placeholder="Reminders to self, payment details, delivery info…"
          className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 resize-vertical"
        />
        <p className="text-xs text-neutral-400 mt-1.5">Saves when you tap away.</p>
      </section>

      {order.remindersSent.length > 0 && (
        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Reminders sent
          </h2>
          <p className="text-xs text-neutral-500">{order.remindersSent.join(", ")}</p>
        </section>
      )}

      <section className="pt-2">
        <button
          onClick={handleDelete}
          disabled={saving}
          className={`w-full text-sm font-medium py-2.5 rounded-full border transition-colors ${
            deleteConfirm
              ? "bg-red-600 text-white border-red-600"
              : "text-red-600 border-red-200 hover:bg-red-50"
          }`}
        >
          {deleteConfirm ? "Tap again to confirm delete" : "Delete order"}
        </button>
      </section>
    </div>
  );
}
