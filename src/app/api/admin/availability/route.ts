import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";
import type { AvailabilityStatus } from "@/generated/prisma";
import { addMonthsToMonthKey, dateKeyFromDbDate, isDateKey, isMonthKey, toDbDate } from "@/lib/businessDate";

const STATUSES: AvailabilityStatus[] = ["available", "limited", "fully_booked", "closed"];

// AvailabilityDate.date is @db.Date: always build it as UTC midnight, whatever zone the server runs in.
const toDate = toDbDate;

export async function GET(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const month = req.nextUrl.searchParams.get("month");
  const where = isMonthKey(month)
    ? { date: { gte: toDate(`${month}-01`), lt: toDate(`${addMonthsToMonthKey(month, 1)}-01`) } }
    : {};

  const dates = await prisma.availabilityDate.findMany({ where, orderBy: { date: "asc" } });
  return NextResponse.json({
    ok: true,
    dates: dates.map((d) => ({
      id: d.id,
      date: dateKeyFromDbDate(d.date),
      status: d.status,
      note: d.note,
    })),
  });
}

export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const body = (await req.json()) as { date?: string; status?: AvailabilityStatus | "clear"; note?: string };
  if (!isDateKey(body.date)) {
    return NextResponse.json({ ok: false, error: "Valid date required." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    if (body.status === "clear") {
      await tx.availabilityDate.deleteMany({ where: { date: toDate(body.date!) } });
      await logAdminWriteWithClient(tx, {
        actor, method: req.method, path: req.nextUrl.pathname, action: "availability.clear",
        targetType: "availabilityDate", targetId: body.date!, requestJson: body, responseJson: { date: body.date }, ok: true,
      });
      return { date: body.date, status: "clear", note: null };
    }

    if (!body.status || !STATUSES.includes(body.status)) {
      return null;
    }

    const saved = await tx.availabilityDate.upsert({
      where: { date: toDate(body.date!) },
      update: { status: body.status, note: body.note?.trim() || null },
      create: { date: toDate(body.date!), status: body.status, note: body.note?.trim() || null },
    });
    await logAdminWriteWithClient(tx, {
      actor, method: req.method, path: req.nextUrl.pathname, action: "availability.upsert",
      targetType: "availabilityDate", targetId: saved.id, requestJson: body,
      responseJson: { id: saved.id, date: dateKeyFromDbDate(saved.date), status: saved.status }, ok: true,
    });
    return { id: saved.id, date: dateKeyFromDbDate(saved.date), status: saved.status, note: saved.note };
  });

  if (!result) return NextResponse.json({ ok: false, error: "Valid status required." }, { status: 400 });
  return NextResponse.json({ ok: true, date: result });
}
