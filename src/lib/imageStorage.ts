import path from "node:path";
import { rm } from "node:fs/promises";
import { prisma } from "@/lib/prisma";

export { sniffImageType, type SniffedImage } from "@/lib/imageSniff";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGES_PER_ORDER = 20;

export function uploadsRoot(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

export function orderUploadDir(orderId: string): string {
  return path.join(uploadsRoot(), "orders", orderId);
}

/**
 * Delete an order's photos: files first, then rows.
 *
 * The retention job finds work by looking for OrderImage rows. Deleting files first means a failure at
 * either step leaves the rows in place, so the next run retries; deleting rows first could orphan files
 * on disk forever. rm with force treats already-missing files as done, so a retry is safe.
 */
export async function purgeOrderImages(orderId: string): Promise<void> {
  await rm(orderUploadDir(orderId), { recursive: true, force: true });
  await prisma.orderImage.deleteMany({ where: { orderId } });
}

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

/** Decode a base64 data URL. Returns null when it is not a well-formed base64 data URL. */
export function decodeDataUrl(dataUrl: string): Buffer | null {
  const match = /^data:[^;,]{0,100};base64,/.exec(dataUrl);
  if (!match) return null;
  const payload = dataUrl.slice(match[0].length);
  if (payload.length === 0 || payload.length % 4 !== 0 || !BASE64_RE.test(payload)) return null;
  return Buffer.from(payload, "base64");
}

/** A short, safe display name for an uploaded file (stored and shown, never used as a path). */
export function safeOriginalName(name: unknown, fallback = "photo"): string {
  const cleaned = typeof name === "string" ? name.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
  return (cleaned || fallback).slice(0, 200);
}
