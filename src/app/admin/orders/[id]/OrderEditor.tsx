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

interface RowItem {
  name: string;
  variantLabel: string;
  quantity: string;
  price: string;
  flavour: string;
  note: string;
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

const blankRow = (): RowItem => ({
  name: "",
  variantLabel: "",
  quantity: "1",
  price: "0",
  flavour: "",
  note: "",
});

function itemsToRows(items: unknown): RowItem[] {
  const arr = (Array.isArray(items) ? items : []) as CartItem[];
  if (arr.length === 0) return [blankRow()];
  return arr.map((it) => ({
    name: it.name ?? "",
    variantLabel: it.variantLabel ?? "",
    quantity: String(it.quantity ?? 1),
    price: String(it.price ?? 0),
    flavour: it.flavour ?? "",
    note: it.note ?? "",
  }));
}

export default function OrderEditor({ order }: { order: SerializedOrder }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [source, setSource] = useState<OrderSource>(order.source);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || "");
  const [customerNotes, setCustomerNotes] = useState(order.customerNotes || "");
  const [neededDate, setNeededDate] = useState(order.neededDate || "");
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || "");

  const [editingItems, setEditingItems] = useState(false);
  const [rows, setRows] = useState<RowItem[]>(itemsToRows(order.items));
  const [itemsSaving, setItemsSaving] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const items = (Array.isArray(order.items) ? order.items : []) as CartItem[];
  const editingTotal = rows.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.price) || 0),
    0,
  );

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
      return true;
    } catch {
      alert("Couldn't save — try again.");
      return false;
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

  async function handleInternalNotesBlur() {
    if (internalNotes === (order.internalNotes || "")) return;
    await save({ internalNotes: internalNotes || null });
  }

  async function handleCustomerNotesBlur() {
    if (customerNotes === (order.customerNotes || "")) return;
    await save({ customerNotes: customerNotes || null });
  }

  async function handleDateChange(newDate: string) {
    setNeededDate(newDate);
    await save({ neededDate: newDate || null });
  }

  async function handleNameBlur() {
    const trimmed = customerName.trim();
    if (!trimmed) {
      setCustomerName(order.customerName);
      return;
    }
    if (trimmed === order.customerName) return;
    await save({ customerName: trimmed });
  }

  async function handleEmailBlur() {
    const trimmed = customerEmail.trim();
    if (!trimmed) {
      setCustomerEmail(order.customerEmail);
      return;
    }
    if (trimmed === order.customerEmail) return;
    await save({ customerEmail: trimmed });
  }

  async function handlePhoneBlur() {
    const trimmed = customerPhone.trim();
    if (trimmed === (order.customerPhone || "")) return;
    await save({ customerPhone: trimmed || null });
  }

  function updateRow(idx: number, field: keyof RowItem, value: string) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, blankRow()]);
  }
  function removeRow(idx: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function startEditingItems() {
    setRows(itemsToRows(order.items));
    setItemsError(null);
    setEditingItems(true);
  }

  function cancelEditingItems() {
    setRows(itemsToRows(order.items));
    setItemsError(null);
    setEditingItems(false);
  }

  async function saveItems() {
    setItemsError(null);
    const cleaned = rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        variantLabel: r.variantLabel.trim() || undefined,
        quantity: Math.max(1, Number(r.quantity) || 1),
        price: Number(r.price) || 0,
        flavour: r.flavour.trim() || undefined,
        note: r.note.trim() || undefined,
      }));
    if (cleaned.length === 0) {
      setItemsError("Add at least one item.");
      return;
    }
    const total = cleaned.reduce((sum, it) => sum + it.quantity * it.price, 0);

    setItemsSaving(true);
    try {
      const ok = await save({ items: cleaned, totalPrice: total });
      if (ok) setEditingItems(false);
    } finally {
      setItemsSaving(false);
    }
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
          <div className="min-w-0 flex-1">
            <div className="kicker mb-2">{formatOrderNumber(order.orderNumber)}</div>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={handleNameBlur}
              disabled={saving}
              className="text-3xl font-medium italic mb-1 bg-transparent border-b border-transparent focus:border-cherry/40 focus:outline-none w-full px-0 py-0.5 -mx-0.5"
              style={{ fontFamily: "var(--font-fraunces)" }}
            />
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`pill ${STATUS_CHIP[status]}`}>{STATUS_LABEL[status]}</span>
            <span className={`pill ${SOURCE_CHIP[source]}`}>{SOURCE_LABEL[source]}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={saving}
            placeholder="email@example.com"
            className="text-sm text-cherry bg-transparent border-b border-transparent focus:border-cherry/40 focus:outline-none w-full px-0 py-0.5"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            onBlur={handlePhoneBlur}
            disabled={saving}
            placeholder="Phone (optional)"
            className="text-sm text-ink-soft bg-transparent border-b border-transparent focus:border-cherry/40 focus:outline-none w-full px-0 py-0.5"
          />
        </div>
        <div className="text-xs text-ink-soft mt-3">Received {new Date(order.createdAt).toLocaleString()}</div>
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
          {!editingItems && (
            <button
              type="button"
              onClick={startEditingItems}
              className="text-[11px] tracking-[0.18em] uppercase text-cherry hover:text-rose-deep font-semibold"
            >
              Edit
            </button>
          )}
        </div>

        {!editingItems ? (
          <>
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
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--rule)]">
              <span className="kicker">Total</span>
              <span className="text-xl font-medium text-ink" style={{ fontFamily: "var(--font-fraunces)" }}>
                ${Number(order.totalPrice).toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div key={idx} className="border border-[var(--rule)] rounded-2xl p-3 space-y-2 bg-white/40">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Item name" value={row.name} onChange={(e) => updateRow(idx, "name", e.target.value)} className="field" />
                  <input placeholder="Variant / size" value={row.variantLabel} onChange={(e) => updateRow(idx, "variantLabel", e.target.value)} className="field" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" min="1" placeholder="Qty" value={row.quantity} onChange={(e) => updateRow(idx, "quantity", e.target.value)} className="field" />
                  <input type="number" step="0.01" min="0" placeholder="Unit price" value={row.price} onChange={(e) => updateRow(idx, "price", e.target.value)} className="field" />
                  <button type="button" onClick={() => removeRow(idx)} disabled={rows.length === 1} className="text-[11px] tracking-[0.16em] uppercase font-medium text-ink-soft hover:text-[#b91c1c] disabled:opacity-40">
                    Remove
                  </button>
                </div>
                <input placeholder="Flavour (optional)" value={row.flavour} onChange={(e) => updateRow(idx, "flavour", e.target.value)} className="field" />
                <input placeholder="Design / note (optional)" value={row.note} onChange={(e) => updateRow(idx, "note", e.target.value)} className="field" />
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="text-[11px] tracking-[0.18em] uppercase text-cherry hover:text-rose-deep font-semibold"
            >
              + Add item
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--rule)]">
              <span className="kicker">New total</span>
              <span className="text-xl font-medium text-cherry" style={{ fontFamily: "var(--font-fraunces)" }}>
                ${editingTotal.toFixed(2)}
              </span>
            </div>

            {itemsError && <p className="text-sm text-[#b91c1c]">{itemsError}</p>}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={saveItems}
                disabled={itemsSaving || saving}
                className="btn-cherry flex-1 justify-center disabled:opacity-60"
              >
                {itemsSaving ? "Saving…" : "Save items"}
              </button>
              <button
                type="button"
                onClick={cancelEditingItems}
                disabled={itemsSaving}
                className="text-[12px] tracking-[0.18em] uppercase font-semibold py-3 px-5 rounded-full border border-[var(--rule)] text-ink-soft hover:bg-white/60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="admin-card p-5">
        <div className="kicker mb-2">Customer notes</div>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          onBlur={handleCustomerNotesBlur}
          disabled={saving}
          rows={3}
          placeholder="What the customer wrote — design requests, allergies, delivery prefs…"
          className="field resize-vertical"
        />
        <p className="text-xs text-ink-soft mt-1.5">Saves when you tap away.</p>
      </section>

      <section className="admin-card p-5">
        <div className="kicker mb-3">Internal notes</div>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          onBlur={handleInternalNotesBlur}
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
