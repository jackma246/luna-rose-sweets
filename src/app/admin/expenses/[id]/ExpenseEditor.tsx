"use client";

import { useState, FormEvent } from "react";
import { EXPENSE_CATEGORIES, CATEGORY_LABEL } from "@/lib/expenseCategories";
import type { ExpenseCategory } from "@/generated/prisma";

interface SerializedExpense {
  id: string;
  date: string;
  amount: number;
  vendor: string;
  category: ExpenseCategory;
  notes: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ExpenseEditor({ expense }: { expense: SerializedExpense }) {
  const [date, setDate] = useState(expense.date);
  const [amount, setAmount] = useState(String(expense.amount));
  const [vendor, setVendor] = useState(expense.vendor);
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [notes, setNotes] = useState(expense.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          amount: Number(amount),
          vendor,
          category,
          notes: notes || null,
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

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/expenses/${expense.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      window.location.assign("/admin/expenses");
    } catch {
      setError("Couldn't delete.");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300";
  const labelCls = "block text-sm font-medium text-neutral-700 mb-1";

  return (
    <>
      <h1 className="text-2xl font-semibold mb-5">Edit expense</h1>
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
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} required className={inputCls} />
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
          <label className={labelCls}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls + " resize-vertical"} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-full disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
      <button
        onClick={handleDelete}
        disabled={saving}
        className={`mt-4 w-full text-sm font-medium py-2.5 rounded-full border transition-colors ${
          deleteConfirm ? "bg-red-600 text-white border-red-600" : "text-red-600 border-red-200 hover:bg-red-50"
        }`}
      >
        {deleteConfirm ? "Tap again to confirm delete" : "Delete expense"}
      </button>
    </>
  );
}
