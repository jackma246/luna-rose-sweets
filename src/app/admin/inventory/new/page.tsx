"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABEL,
} from "@/lib/inventoryCategories";
import type { InventoryCategory } from "@/generated/prisma";

export default function NewInventoryItemPage() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("ingredient");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          unit: unit || undefined,
          category,
          lowStockThreshold:
            lowStockThreshold === "" ? null : Number(lowStockThreshold),
          notes: notes || undefined,
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

  return (
    <div>
      <Link
        href="/admin/inventory"
        className="text-[12px] tracking-[0.2em] uppercase text-ink-soft hover:text-cherry mb-4 inline-block"
      >
        ← All inventory
      </Link>
      <div className="kicker mb-2">New item</div>
      <h1 className="text-3xl italic font-light leading-none mb-6">
        Add to <span className="font-medium">stock</span>
      </h1>

      <form onSubmit={onSubmit} className="admin-card p-6 space-y-4">
        <div>
          <label className="kicker block mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Couverture chocolate, sprinkles, sticks…"
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
            <label className="kicker block mb-1.5">
              Unit{" "}
              <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">
                (optional)
              </span>
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="lbs, cups, ea, rolls…"
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
          <label className="kicker block mb-1.5">
            Reorder when at or below{" "}
            <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">
              (optional)
            </span>
          </label>
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
          <label className="kicker block mb-1.5">
            Notes{" "}
            <span className="text-ink-soft normal-case tracking-normal font-normal text-[10px] ml-1">
              (optional)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Brand, supplier, anything to remember…"
            className="field resize-vertical"
          />
        </div>

        {error && <p className="text-sm text-[#b91c1c]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn-cherry w-full justify-center disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save item"}
        </button>
      </form>
    </div>
  );
}
