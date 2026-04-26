"use client";

import { useState, FormEvent } from "react";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABEL,
} from "@/lib/inventoryCategories";
import type { InventoryCategory } from "@/generated/prisma";

interface SerializedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category: InventoryCategory;
  lowStockThreshold: number | null;
  notes: string | null;
}

export default function InventoryEditor({ item }: { item: SerializedItem }) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit || "");
  const [category, setCategory] = useState<InventoryCategory>(item.category);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    item.lowStockThreshold === null ? "" : String(item.lowStockThreshold),
  );
  const [notes, setNotes] = useState(item.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          unit: unit || null,
          category,
          lowStockThreshold:
            lowStockThreshold === "" ? null : Number(lowStockThreshold),
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      window.location.assign("/admin/inventory");
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
      const res = await fetch(`/api/admin/inventory/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      window.location.assign("/admin/inventory");
    } catch {
      setError("Couldn't delete.");
      setSaving(false);
    }
  }

  return (
    <>
      <div className="kicker mb-2">Edit</div>
      <h1 className="text-3xl italic font-light leading-none mb-6">
        Update <span className="font-medium">item</span>
      </h1>
      <form onSubmit={onSubmit} className="admin-card p-6 space-y-4">
        <div>
          <label className="kicker block mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="kicker block mb-1.5">Quantity</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="field"
            />
          </div>
          <div>
            <label className="kicker block mb-1.5">Unit</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="kicker block mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as InventoryCategory)}
            className="field cursor-pointer"
          >
            {INVENTORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {INVENTORY_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kicker block mb-1.5">Reorder when at or below</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            placeholder="Leave blank for no alert"
            className="field"
          />
        </div>

        <div>
          <label className="kicker block mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="field resize-vertical"
          />
        </div>

        {error && <p className="text-sm text-[#b91c1c]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn-cherry w-full justify-center disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
      <button
        onClick={handleDelete}
        disabled={saving}
        className={`mt-4 w-full text-[12px] tracking-[0.18em] uppercase font-semibold py-3 rounded-full border transition-colors ${
          deleteConfirm
            ? "bg-[#b91c1c] text-paper border-[#b91c1c]"
            : "text-[#b91c1c] border-[#fecaca] hover:bg-[#fef2f2]"
        }`}
      >
        {deleteConfirm ? "Tap again to confirm delete" : "Delete item"}
      </button>
    </>
  );
}
