import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InventoryEditor from "./InventoryEditor";

export const dynamic = "force-dynamic";

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) notFound();

  const serialized = {
    id: item.id,
    name: item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    category: item.category,
    lowStockThreshold:
      item.lowStockThreshold === null ? null : Number(item.lowStockThreshold),
    notes: item.notes,
  };

  return (
    <div>
      <Link
        href="/admin/inventory"
        className="text-[12px] tracking-[0.2em] uppercase text-ink-soft hover:text-cherry mb-4 inline-block"
      >
        ← All inventory
      </Link>
      <InventoryEditor item={serialized} />
    </div>
  );
}
