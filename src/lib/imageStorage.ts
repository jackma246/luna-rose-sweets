import path from "node:path";
import { rm } from "node:fs/promises";
import { prisma } from "@/lib/prisma";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGES_PER_ORDER = 20;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

export function uploadsRoot(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

export function orderUploadDir(orderId: string): string {
  return path.join(uploadsRoot(), "orders", orderId);
}

export async function purgeOrderImages(orderId: string): Promise<void> {
  await prisma.orderImage.deleteMany({ where: { orderId } });
  await rm(orderUploadDir(orderId), { recursive: true, force: true });
}

export function extensionFromMime(mime: string, originalName: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName && /^\.[a-z0-9]+$/.test(fromName)) return fromName;
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/heic":
      return ".heic";
    case "image/heif":
      return ".heif";
    default:
      return ".bin";
  }
}
