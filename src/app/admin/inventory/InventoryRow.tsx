"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  INVENTORY_CATEGORY_CHIP,
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

export default function InventoryRow({ item }: { item: SerializedItem }) {
  const router = useRouter();
  const [delta, setDelta] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(item.quantity);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLow =
    item.lowStockThreshold !== null && quantity <= item.lowStockThreshold;
  const unitLabel = item.unit ? ` ${item.unit}` : "";

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setError(null);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't delete.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  async function adjust(sign: 1 | -1) {
    const amt = Number(delta);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: sign * amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't adjust.");
      setQuantity(Number(data.item.quantity));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't adjust.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`admin-card p-4 ${
        isLow ? "border-l-4 border-cherry" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <Link
            href={`/admin/inventory/${item.id}`}
            className="text-[15px] font-semibold text-ink hover:text-cherry truncate block"
          >
            {item.name}
          </Link>
          {item.notes && (
            <div className="text-xs text-ink-soft truncate mt-0.5">{item.notes}</div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLow && <span className="pill bg-rose-100 text-rose-800">Low</span>}
          <span className={`pill ${INVENTORY_CATEGORY_CHIP[item.category]}`}>
            {INVENTORY_CATEGORY_LABEL[item.category]}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--rule)] gap-3 flex-wrap">
        <div>
          <span
            className="text-2xl font-medium text-ink"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {formatQty(quantity)}
          </span>
          <span className="text-sm text-ink-soft ml-1">
            {unitLabel.trim() || "on hand"}
          </span>
          {item.lowStockThreshold !== null && (
            <span className="text-xs text-ink-soft ml-3">
              reorder at {formatQty(item.lowStockThreshold)}
              {unitLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            disabled={busy}
            className="field !py-1.5 !px-2 w-20 text-right"
          />
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={busy}
            className="text-[11px] tracking-[0.18em] uppercase font-semibold py-1.5 px-3 rounded-full border border-[var(--rule)] text-ink hover:bg-paper-deep disabled:opacity-50"
          >
            − Use
          </button>
          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={busy}
            className="text-[11px] tracking-[0.18em] uppercase font-semibold py-1.5 px-3 rounded-full bg-cherry text-paper hover:bg-rose-deep disabled:opacity-50"
          >
            + Add
          </button>
          <button
            type="button"
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            disabled={busy}
            className={`text-[11px] tracking-[0.18em] uppercase font-semibold py-1.5 px-3 rounded-full border disabled:opacity-50 ${
              confirmDelete
                ? "bg-rose-deep text-paper border-rose-deep"
                : "border-[var(--rule)] text-ink-soft hover:bg-paper-deep hover:text-ink"
            }`}
          >
            {confirmDelete ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-[#b91c1c] mt-2">{error}</p>}
    </div>
  );
}

function formatQty(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, "");
}
