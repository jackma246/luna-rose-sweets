import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredOrderImages, RETENTION_DAYS, STALE_DAYS } from "@/lib/retention";
import { cronAuthFailure } from "@/lib/cronAuth";
import { describeError } from "@/lib/logging";

/**
 * Scheduled deletion of customer inspiration photos.
 * Same auth contract as /api/cron/reminders: Bearer CRON_SECRET (503 when unset).
 *
 *   GET  ?dry=1   report what would be deleted, delete nothing
 *   GET           delete
 */
export async function GET(req: NextRequest) {
  const denied = cronAuthFailure(req.headers.get("authorization"));
  if (denied) return denied;

  const dryRun = req.nextUrl.searchParams.get("dry") === "1";

  try {
    const result = await purgeExpiredOrderImages({ dryRun });
    return NextResponse.json({
      ok: true,
      dryRun,
      policy: { retentionDays: RETENTION_DAYS, staleDays: STALE_DAYS },
      candidates: result.candidates.length,
      purgedOrders: result.purgedOrders,
      purgedImages: result.purgedImages,
      purgedMB: Number((result.purgedBytes / 1048576).toFixed(2)),
      errors: result.errors,
      detail: result.candidates.map((c) => ({
        orderNumber: c.orderNumber, reason: c.reason,
        images: c.imageCount, ageDays: c.ageDays,
      })),
    });
  } catch (error) {
    console.error("purge-images cron failed:", describeError(error));
    return NextResponse.json({ ok: false, error: "purge failed" }, { status: 500 });
  }
}
