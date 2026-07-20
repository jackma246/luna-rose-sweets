import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredOrderImages, RETENTION_DAYS, STALE_DAYS } from "@/lib/retention";

/**
 * Scheduled deletion of customer inspiration photos.
 * Same auth contract as /api/cron/reminders: Bearer CRON_SECRET.
 *
 *   GET  ?dry=1   report what would be deleted, delete nothing
 *   GET           delete
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

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
    const message = error instanceof Error ? error.message : "purge failed";
    console.error("purge-images cron failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
