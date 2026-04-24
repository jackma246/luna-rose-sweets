import type { OrderStatus } from "@/generated/prisma";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "deposit_received",
  "prepping",
  "cake_prepped",
  "ready",
  "delivered",
  "completed",
  "cancelled",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  deposit_received: "Deposit received",
  prepping: "Prepping",
  cake_prepped: "Cake prepped",
  ready: "Ready for pickup",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Tailwind classes for a status chip (bg + text). Kept minimal + distinct.
export const STATUS_CHIP: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  deposit_received: "bg-indigo-100 text-indigo-800",
  prepping: "bg-violet-100 text-violet-800",
  cake_prepped: "bg-purple-100 text-purple-800",
  ready: "bg-teal-100 text-teal-800",
  delivered: "bg-emerald-100 text-emerald-800",
  completed: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-neutral-100 text-neutral-500",
};

export function isTerminal(status: OrderStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function daysUntil(date: Date | null | undefined): number | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function daysUntilLabel(days: number | null): string {
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days}d`;
}
