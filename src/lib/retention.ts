/**
 * Customer photo retention.
 *
 * Inspiration photos are customer property and are only needed while an order is
 * being made. Once an order is finished we keep them for a short grace period and
 * then delete them - both the database rows and the files on disk.
 *
 * Two rules, because orders do not always get marked completed:
 *   1. FINISHED  - order is in a terminal status (completed / cancelled) and the
 *                  order was last touched more than RETENTION_DAYS ago.
 *   2. ABANDONED - the order never reached a terminal status and either its
 *                  pickup date passed more than STALE_DAYS ago, or it has no
 *                  pickup date and was placed more than STALE_DAYS ago. Without
 *                  this, a forgotten order keeps a customer's photos forever.
 *
 * Completing an order does not delete its photos immediately; this job does,
 * RETENTION_DAYS later.
 */
import { prisma } from "@/lib/prisma";
import { purgeOrderImages } from "@/lib/imageStorage";
import { isTerminal } from "@/lib/orderStatus";

/** Positive whole number of days from an env var, or the default when unset or invalid. */
export function daysFromEnv(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export const RETENTION_DAYS = daysFromEnv(process.env.PHOTO_RETENTION_DAYS, 7);
export const STALE_DAYS = daysFromEnv(process.env.PHOTO_STALE_DAYS, 30);

export interface PurgeCandidate {
  orderId: string;
  orderNumber: number;
  reason: "finished" | "abandoned" | "undated";
  imageCount: number;
  bytes: number;
  ageDays: number;
}

export interface PurgeResult {
  dryRun: boolean;
  candidates: PurgeCandidate[];
  purgedOrders: number;
  purgedImages: number;
  purgedBytes: number;
  errors: { orderId: string; message: string }[];
}

function daysSince(d: Date | null | undefined, now: number): number {
  if (!d) return Number.POSITIVE_INFINITY;
  return Math.floor((now - new Date(d).getTime()) / 86_400_000);
}

export async function findPurgeCandidates(now = Date.now()): Promise<PurgeCandidate[]> {
  // only orders that actually still hold images
  const orders = await prisma.order.findMany({
    where: { images: { some: {} } },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      updatedAt: true,
      createdAt: true,
      neededDate: true,
      images: { select: { size: true } },
    },
  });

  const out: PurgeCandidate[] = [];
  for (const o of orders) {
    const bytes = o.images.reduce((s, i) => s + i.size, 0);
    const terminal = isTerminal(o.status);
    const sinceTouched = daysSince(o.updatedAt, now);
    const sincePickup = daysSince(o.neededDate, now);
    const sinceCreated = daysSince(o.createdAt, now);

    if (terminal && sinceTouched >= RETENTION_DAYS) {
      out.push({
        orderId: o.id, orderNumber: o.orderNumber, reason: "finished",
        imageCount: o.images.length, bytes, ageDays: sinceTouched,
      });
    } else if (!terminal && o.neededDate && sincePickup >= STALE_DAYS) {
      out.push({
        orderId: o.id, orderNumber: o.orderNumber, reason: "abandoned",
        imageCount: o.images.length, bytes, ageDays: sincePickup,
      });
    } else if (!terminal && !o.neededDate && sinceCreated >= STALE_DAYS) {
      out.push({
        orderId: o.id, orderNumber: o.orderNumber, reason: "undated",
        imageCount: o.images.length, bytes, ageDays: sinceCreated,
      });
    }
  }
  return out;
}

export async function purgeExpiredOrderImages(
  { dryRun = false, now = Date.now() }: { dryRun?: boolean; now?: number } = {},
): Promise<PurgeResult> {
  const candidates = await findPurgeCandidates(now);
  const result: PurgeResult = {
    dryRun, candidates, purgedOrders: 0, purgedImages: 0, purgedBytes: 0, errors: [],
  };
  if (dryRun) return result;

  for (const c of candidates) {
    try {
      await purgeOrderImages(c.orderId);
      result.purgedOrders += 1;
      result.purgedImages += c.imageCount;
      result.purgedBytes += c.bytes;
    } catch (error) {
      result.errors.push({
        orderId: c.orderId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return result;
}
