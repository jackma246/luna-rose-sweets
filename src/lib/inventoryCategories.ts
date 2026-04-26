import type { InventoryCategory } from "@/generated/prisma";

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  "ingredient",
  "supply",
  "packaging",
  "equipment",
  "other",
];

export const INVENTORY_CATEGORY_LABEL: Record<InventoryCategory, string> = {
  ingredient: "Ingredient",
  supply: "Supply",
  packaging: "Packaging",
  equipment: "Equipment",
  other: "Other",
};

export const INVENTORY_CATEGORY_CHIP: Record<InventoryCategory, string> = {
  ingredient: "bg-emerald-100 text-emerald-800",
  supply: "bg-sky-100 text-sky-800",
  packaging: "bg-amber-100 text-amber-800",
  equipment: "bg-purple-100 text-purple-800",
  other: "bg-neutral-200 text-neutral-700",
};
