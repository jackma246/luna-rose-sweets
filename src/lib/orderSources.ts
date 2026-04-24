import type { OrderSource } from "@/generated/prisma";

export const ORDER_SOURCES: OrderSource[] = [
  "website",
  "instagram",
  "fb_marketplace",
  "tiktok",
];

export const SOURCE_LABEL: Record<OrderSource, string> = {
  website: "Website",
  instagram: "Instagram",
  fb_marketplace: "FB Marketplace",
  tiktok: "TikTok",
};

export const SOURCE_CHIP: Record<OrderSource, string> = {
  website: "bg-stone-100 text-stone-700",
  instagram: "bg-pink-100 text-pink-800",
  fb_marketplace: "bg-blue-100 text-blue-800",
  tiktok: "bg-neutral-900 text-white",
};
