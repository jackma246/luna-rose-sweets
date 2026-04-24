"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/orderStatus";
import { ORDER_SOURCES, SOURCE_LABEL } from "@/lib/orderSources";
import type { OrderStatus, OrderSource } from "@/generated/prisma";

interface RowItem {
  name: string;
  variantLabel: string;
  quantity: string;
  price: string;
  flavour: string;
  note: string;
}

const blankItem = (): RowItem => ({
  name: "",
  variantLabel: "",
  quantity: "1",
  price: "0",
  flavour: "",
  note: "",
});

export default function NewOrderPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [source, setSource] = useState<OrderSource>("website");
  const [rows, setRows] = useState<RowItem[]>([blankItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = rows.reduce((sum, r) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.price) || 0;
    return sum + qty * price;
  }, 0);

  function updateRow(idx: number, field: keyof RowItem, value: string) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, blankItem()]);
  }
  function removeRow(idx: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
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
      setError("Add at least one item.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          items: cleaned,
          totalPrice: total,
          neededDate: neededDate || undefined,
          customerNotes: customerNotes || undefined,
          internalNotes: internalNotes || undefined,
          status,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      window.location.assign(`/admin/orders/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setSaving(false);
    }
  }

  return (
    <div>
      <Link href="/admin" className="text-[12px] tracking-[0.2em] uppercase text-ink-soft hover:text-cherry mb-4 inline-block">
        ← All orders
      </Link>
      <div className="kicker mb-2">New order</div>
      <h1 className="text-3xl italic font-light leading-none mb-6">
        Create an <span className="font-medium">order</span>
      </h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="admin-card p-6 space-y-4">
          <h2 className="section-title">Customer</h2>
          <div>
            <label className="kicker block mb-1.5">Name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="field" />
          </div>
          <div>
            <label className="kicker block mb-1.5">Email</label>
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required className="field" />
          </div>
          <div>
            <label className="kicker block mb-1.5">Phone <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">(optional)</span></label>
            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="field" />
          </div>
        </section>

        <section className="admin-card p-6 space-y-4">
          <h2 className="section-title">Order</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="kicker block mb-1.5">Needed by</label>
              <input type="date" value={neededDate} onChange={(e) => setNeededDate(e.target.value)} className="field" />
            </div>
            <div>
              <label className="kicker block mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="field cursor-pointer">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="kicker block mb-1.5">Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value as OrderSource)} className="field cursor-pointer">
              {ORDER_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="kicker">Items</div>
              <button type="button" onClick={addRow} className="text-[11px] tracking-[0.18em] uppercase text-cherry hover:text-rose-deep font-semibold">
                + Add item
              </button>
            </div>
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
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--rule)]">
            <span className="kicker">Total</span>
            <span className="text-2xl font-medium text-cherry" style={{ fontFamily: "var(--font-fraunces)" }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </section>

        <section className="admin-card p-6 space-y-4">
          <h2 className="section-title">Notes</h2>
          <div>
            <label className="kicker block mb-1.5">Customer notes <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">(what they said)</span></label>
            <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={2} className="field resize-vertical" />
          </div>
          <div>
            <label className="kicker block mb-1.5">Internal notes <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">(your notes)</span></label>
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} className="field resize-vertical" />
          </div>
        </section>

        {error && <p className="text-sm text-[#b91c1c]">{error}</p>}

        <button type="submit" disabled={saving} className="btn-cherry w-full justify-center disabled:opacity-60">
          {saving ? "Saving…" : "Save order"}
        </button>
      </form>
    </div>
  );
}
