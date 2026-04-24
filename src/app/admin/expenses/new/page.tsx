"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { EXPENSE_CATEGORIES, CATEGORY_LABEL } from "@/lib/expenseCategories";
import type { ExpenseCategory } from "@/generated/prisma";

export default function NewExpensePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("ingredient");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          amount: Number(amount),
          vendor,
          category,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      window.location.assign("/admin/expenses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300";
  const labelCls = "block text-sm font-medium text-neutral-700 mb-1";

  return (
    <div>
      <Link href="/admin/expenses" className="text-sm text-neutral-500 hover:text-neutral-900 mb-4 inline-block">
        ← All expenses
      </Link>
      <h1 className="text-2xl font-semibold mb-5">New expense</h1>

      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-xl border border-neutral-200 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Amount ($)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Vendor</label>
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} required placeholder="Costco, Amazon, Michael's, etc." className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className={inputCls}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Notes <span className="text-neutral-400 font-normal">(optional)</span></label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Couverture chocolate, cake pop sticks, etc." className={inputCls + " resize-vertical"} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-full disabled:opacity-60">
          {saving ? "Saving…" : "Save expense"}
        </button>
      </form>
    </div>
  );
}
