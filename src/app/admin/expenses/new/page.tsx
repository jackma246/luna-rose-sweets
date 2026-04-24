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

  return (
    <div>
      <Link href="/admin/expenses" className="text-[12px] tracking-[0.2em] uppercase text-ink-soft hover:text-cherry mb-4 inline-block">
        ← All expenses
      </Link>
      <div className="kicker mb-2">New expense</div>
      <h1 className="text-3xl italic font-light leading-none mb-6">
        Log a <span className="font-medium">spend</span>
      </h1>

      <form onSubmit={onSubmit} className="admin-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="kicker block mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="field" />
          </div>
          <div>
            <label className="kicker block mb-1.5">Amount ($)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className="field" />
          </div>
        </div>

        <div>
          <label className="kicker block mb-1.5">Vendor</label>
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} required placeholder="Costco, Amazon, Michael's…" className="field" />
        </div>

        <div>
          <label className="kicker block mb-1.5">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="field cursor-pointer">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kicker block mb-1.5">Notes <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">(optional)</span></label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Couverture chocolate, cake pop sticks…" className="field resize-vertical" />
        </div>

        {error && <p className="text-sm text-[#b91c1c]">{error}</p>}

        <button type="submit" disabled={saving} className="btn-cherry w-full justify-center disabled:opacity-60">
          {saving ? "Saving…" : "Save expense"}
        </button>
      </form>
    </div>
  );
}
