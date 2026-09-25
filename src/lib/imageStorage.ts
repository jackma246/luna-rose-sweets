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

export interface SniffedImage {
  mime: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/heic" | "image/heif";
  ext: ".jpg" | ".png" | ".webp" | ".gif" | ".heic" | ".heif";
}

const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs"]);
const HEIF_BRANDS = new Set(["mif1", "msf1", "heif"]);

function ascii(buf: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...buf.subarray(start, end));
}

/**
 * Identify an image by its magic bytes. The declared MIME type and file name are client-controlled and
 * never trusted: the stored type and the file extension always come from here.
 */
export function sniffImageType(buf: Uint8Array): SniffedImage | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: ".jpg" };
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { mime: "image/png", ext: ".png" };
  }
  if (buf.length >= 6 && (ascii(buf, 0, 6) === "GIF87a" || ascii(buf, 0, 6) === "GIF89a")) return { mime: "image/gif", ext: ".gif" };
  if (buf.length >= 12 && ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP") return { mime: "image/webp", ext: ".webp" };
  if (buf.length >= 12 && ascii(buf, 4, 8) === "ftyp") {
    const brand = ascii(buf, 8, 12);
    if (HEIC_BRANDS.has(brand)) return { mime: "image/heic", ext: ".heic" };
    if (HEIF_BRANDS.has(brand)) return { mime: "image/heif", ext: ".heif" };
  }
  return null;
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
