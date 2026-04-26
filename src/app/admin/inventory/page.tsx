import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABEL,
} from "@/lib/inventoryCategories";
import { FilterChips } from "../FilterChips";
import type { InventoryCategory, Prisma } from "@/generated/prisma";
import InventoryRow from "./InventoryRow";

export const dynamic = "force-dynamic";

interface SearchParams {
  category?: string;
  low?: string;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const categoryFilter =
    sp.category && INVENTORY_CATEGORIES.includes(sp.category as InventoryCategory)
      ? (sp.category as InventoryCategory)
      : null;
  const lowOnly = sp.low === "1";

  const where: Prisma.InventoryItemWhereInput = {};
  if (categoryFilter) where.category = categoryFilter;

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const serialized = items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: Number(i.quantity),
    unit: i.unit,
    category: i.category,
    lowStockThreshold: i.lowStockThreshold === null ? null : Number(i.lowStockThreshold),
    notes: i.notes,
  }));

  const visible = lowOnly
    ? serialized.filter(
        (i) => i.lowStockThreshold !== null && i.quantity <= i.lowStockThreshold,
      )
    : serialized;

  const lowCount = serialized.filter(
    (i) => i.lowStockThreshold !== null && i.quantity <= i.lowStockThreshold,
  ).length;

  const filtersActive = Boolean(categoryFilter) || lowOnly;

  const categoryChipOptions = [
    { value: "all", label: "All" },
    ...INVENTORY_CATEGORIES.map((c) => ({ value: c, label: INVENTORY_CATEGORY_LABEL[c] })),
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="kicker mb-2">Inventory</div>
          <h1 className="text-4xl italic font-light leading-none">
            On <span className="font-medium">hand</span>
          </h1>
        </div>
        <Link href="/admin/inventory/new" className="btn-cherry">
          + New item
        </Link>
      </div>

      <div className="admin-card-soft p-4 mb-6 space-y-3">
        <FilterChips param="category" options={categoryChipOptions} current={sp.category} />
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={lowOnly ? buildUrl(sp, { low: undefined }) : buildUrl(sp, { low: "1" })}
            className={`chip ${lowOnly ? "active chip-cherry" : ""}`}
          >
            Low stock only{lowCount > 0 && !lowOnly ? ` (${lowCount})` : ""}
          </Link>
          {filtersActive && (
            <Link
              href="/admin/inventory"
              className="text-xs text-ink-soft hover:text-ink underline ml-auto"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>

      {lowCount > 0 && !lowOnly && (
        <div className="admin-card p-4 mb-6 border-l-4 border-cherry">
          <div className="kicker mb-1 text-cherry">Reorder soon</div>
          <p className="text-sm text-ink-soft">
            {lowCount} item{lowCount === 1 ? "" : "s"} at or below the low-stock threshold.
          </p>
        </div>
      )}

      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="section-title">{filtersActive ? "Matching" : "All items"}</h2>
        <span className="text-xs text-ink-soft">{visible.length}</span>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-ink-soft px-1">
          {filtersActive
            ? "No items match these filters."
            : "Nothing tracked yet — add your first item."}
        </p>
      ) : (
        <div className="space-y-2.5">
          {visible.map((item) => (
            <InventoryRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildUrl(sp: SearchParams, patch: Partial<SearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...sp, ...patch };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/admin/inventory?${qs}` : "/admin/inventory";
}
