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

  return (
    <>
      <div className="kicker mb-2">Edit</div>
      <h1 className="text-3xl italic font-light leading-none mb-6">
        Update <span className="font-medium">expense</span>
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
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} required className="field" />
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
          <label className="kicker block mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="field resize-vertical" />
        </div>
        {error && <p className="text-sm text-[#b91c1c]">{error}</p>}
        <button type="submit" disabled={saving} className="btn-cherry w-full justify-center disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
      <button
        onClick={handleDelete}
        disabled={saving}
        className={`mt-4 w-full text-[12px] tracking-[0.18em] uppercase font-semibold py-3 rounded-full border transition-colors ${
          deleteConfirm ? "bg-[#b91c1c] text-paper border-[#b91c1c]" : "text-[#b91c1c] border-[#fecaca] hover:bg-[#fef2f2]"
        }`}
      >
        {deleteConfirm ? "Tap again to confirm delete" : "Delete expense"}
      </button>
    </>
  );
}
