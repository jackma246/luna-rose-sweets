import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, isTerminal } from "@/lib/orderStatus";
import { formatOrderNumber } from "@/lib/orderNumber";
import type { Order } from "@/generated/prisma";

type ReminderKey = "d3" | "d2" | "d0";

const WINDOWS: Array<{ key: ReminderKey; daysAway: number; label: string }> = [
  { key: "d3", daysAway: 3, label: "3 days away" },
  { key: "d2", daysAway: 2, label: "2 days away" },
  { key: "d0", daysAway: 0, label: "today" },
];

function dateAtMidnight(daysFromNow: number): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + daysFromNow);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function reminderHtml(orders: Order[], windowLabel: string, baseUrl: string): string {
  const rows = orders
    .map((o) => {
      const date = o.neededDate
        ? new Date(o.neededDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
        : "—";
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;font-size:12px;color:#c05;font-weight:600;white-space:nowrap;">${formatOrderNumber(o.orderNumber)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;">
            <div style="font-weight:600;">${escapeHtml(o.customerName)}</div>
            <div style="color:#999;font-size:12px;">${escapeHtml(o.customerEmail)}${
              o.customerPhone ? ` · ${escapeHtml(o.customerPhone)}` : ""
            }</div>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;font-size:13px;">${date}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;font-size:12px;color:#666;">${STATUS_LABEL[o.status]}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;text-align:right;">
            <a href="${baseUrl}/admin/orders/${o.id}" style="color:#c05;text-decoration:none;font-weight:600;">Open →</a>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:20px 28px;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Orders ${windowLabel}</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">${orders.length} order${orders.length === 1 ? "" : "s"} to act on</p>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;">
          ${rows}
        </table>
      </div>
    </div>
  `;
}

export async function GET(req: NextRequest) {
  // Simple bearer-token auth so anyone hitting this from the internet can't trigger emails.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not set." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.APP_URL || "https://dipsprinkle.com";
  const from = "Dip & Sprinkle <orders@dipsprinkle.com>";

  const summary: Record<ReminderKey, number> = { d3: 0, d2: 0, d0: 0 };

  for (const w of WINDOWS) {
    const { start, end } = dateAtMidnight(w.daysAway);
    const orders = await prisma.order.findMany({
      where: {
        neededDate: { gte: start, lt: end },
        status: { notIn: ["completed", "cancelled"] },
        NOT: { remindersSent: { has: w.key } },
      },
      orderBy: { createdAt: "asc" },
    });

    const actionable = orders.filter((o) => !isTerminal(o.status));
    if (actionable.length === 0) continue;

    try {
      await resend.emails.send({
        from,
        to: "supportdipsprinkle@gmail.com",
        subject: `Reminder: ${actionable.length} order${actionable.length === 1 ? "" : "s"} ${w.label}`,
        html: reminderHtml(actionable, w.label, baseUrl),
      });
      await Promise.all(
        actionable.map((o) =>
          prisma.order.update({
            where: { id: o.id },
            data: { remindersSent: { push: w.key } },
          })
        )
      );
      summary[w.key] = actionable.length;
    } catch (err) {
      console.error(`Reminder send failed for ${w.key}:`, err);
    }
  }

  return NextResponse.json({ ok: true, summary });
}
