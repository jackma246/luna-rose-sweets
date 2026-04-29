import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OrderEditor from "./OrderEditor";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { createdAt: "asc" },
        select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
      },
    },
  });
  if (!order) notFound();

  const serialized = {
    ...order,
    totalPrice: Number(order.totalPrice),
    neededDate: order.neededDate ? order.neededDate.toISOString().slice(0, 10) : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    images: order.images.map((img) => ({
      id: img.id,
      originalName: img.originalName,
      mimeType: img.mimeType,
      size: img.size,
      createdAt: img.createdAt.toISOString(),
    })),
  };

  return (
    <div>
      <Link href="/admin" className="text-[12px] tracking-[0.2em] uppercase text-ink-soft hover:text-cherry mb-4 inline-block">
        ← All orders
      </Link>
      <OrderEditor order={serialized} />
    </div>
  );
}
