import type { ExpenseCategory } from "@/generated/prisma";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ["ingredient", "supply", "packaging", "other"];

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  ingredient: "Ingredient",
  supply: "Supply",
  packaging: "Packaging",
  other: "Other",
};

export const CATEGORY_CHIP: Record<ExpenseCategory, string> = {
  ingredient: "bg-emerald-100 text-emerald-800",
  supply: "bg-sky-100 text-sky-800",
  packaging: "bg-amber-100 text-amber-800",
  other: "bg-neutral-200 text-neutral-700",
};
