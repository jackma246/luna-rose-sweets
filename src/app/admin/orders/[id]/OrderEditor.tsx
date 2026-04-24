"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, STATUS_LABEL, STATUS_CHIP } from "@/lib/orderStatus";
import { ORDER_SOURCES, SOURCE_LABEL, SOURCE_CHIP } from "@/lib/orderSources";
import { formatOrderNumber } from "@/lib/orderNumber";
import type { OrderStatus, OrderSource } from "@/generated/prisma";

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
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  items: unknown;
  totalPrice: number;
  neededDate: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  status: OrderStatus;
  source: OrderSource;
  remindersSent: string[];
  createdAt: string;
  updatedAt: string;
}

export default function OrderEditor({ order }: { order: SerializedOrder }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [source, setSource] = useState<OrderSource>(order.source);
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

  async function handleSourceChange(newSource: OrderSource) {
    setSource(newSource);
    await save({ source: newSource });
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
      <header className="admin-card p-6">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div className="min-w-0">
            <div className="kicker mb-2">{formatOrderNumber(order.orderNumber)}</div>
            <h1 className="text-3xl font-medium italic mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
              {order.customerName}
            </h1>
            <a href={`mailto:${order.customerEmail}`} className="text-sm text-cherry hover:text-rose-deep block">
              {order.customerEmail}
            </a>
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="text-sm text-ink-soft hover:text-ink block">
                {order.customerPhone}
              </a>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`pill ${STATUS_CHIP[status]}`}>{STATUS_LABEL[status]}</span>
            <span className={`pill ${SOURCE_CHIP[source]}`}>{SOURCE_LABEL[source]}</span>
          </div>
        </div>
        <div className="text-xs text-ink-soft">Received {new Date(order.createdAt).toLocaleString()}</div>
      </header>

      <section className="admin-card p-5">
        <div className="kicker mb-3">Status</div>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={saving}
          className="field cursor-pointer"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {saved && <p className="text-xs text-cherry mt-2">Saved ✓</p>}
      </section>

      <section className="admin-card p-5">
        <div className="kicker mb-3">Source</div>
        <select
          value={source}
          onChange={(e) => handleSourceChange(e.target.value as OrderSource)}
          disabled={saving}
          className="field cursor-pointer"
        >
          {ORDER_SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABEL[s]}
            </option>
          ))}
        </select>
      </section>

      <section className="admin-card p-5">
        <div className="kicker mb-3">Needed by</div>
        <input
          type="date"
          value={neededDate}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={saving}
          className="field"
        />
      </section>

      <section className="admin-card p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="kicker">Items</div>
          <div className="text-xl font-medium text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
            ${Number(order.totalPrice).toFixed(2)}
          </div>
        </div>
        <ul className="divide-y divide-[var(--rule)]">
          {items.map((item, idx) => (
            <li key={idx} className="py-3 first:pt-0 last:pb-0">
              <div className="flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-ink truncate">{item.name}</div>
                  {item.variantLabel && <div className="text-ink-soft text-xs">{item.variantLabel}</div>}
                  {item.flavour && <div className="text-ink-soft text-xs">Flavour: {item.flavour}</div>}
                  {item.note && <div className="text-ink-soft text-xs whitespace-pre-wrap">Note: {item.note}</div>}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-ink-soft">×{item.quantity}</div>
                  <div className="font-medium text-ink">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {order.customerNotes && (
        <section className="admin-card p-5">
          <div className="kicker mb-2">Customer notes</div>
          <p className="text-sm whitespace-pre-wrap text-ink">{order.customerNotes}</p>
        </section>
      )}

      <section className="admin-card p-5">
        <div className="kicker mb-3">Internal notes</div>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          onBlur={handleNotesBlur}
          disabled={saving}
          rows={4}
          placeholder="Reminders to self, payment details, delivery info…"
          className="field resize-vertical"
        />
        <p className="text-xs text-ink-soft mt-1.5">Saves when you tap away.</p>
      </section>

      {order.remindersSent.length > 0 && (
        <section className="admin-card p-5">
          <div className="kicker mb-2">Reminders sent</div>
          <p className="text-xs text-ink-soft">{order.remindersSent.join(", ")}</p>
        </section>
      )}

      <section className="pt-2">
        <button
          onClick={handleDelete}
          disabled={saving}
          className={`w-full text-[12px] tracking-[0.18em] uppercase font-semibold py-3 rounded-full border transition-colors ${
            deleteConfirm
              ? "bg-[#b91c1c] text-paper border-[#b91c1c]"
              : "text-[#b91c1c] border-[#fecaca] hover:bg-[#fef2f2]"
          }`}
        >
          {deleteConfirm ? "Tap again to confirm delete" : "Delete order"}
        </button>
      </section>
    </div>
  );
}
