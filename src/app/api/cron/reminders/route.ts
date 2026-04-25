import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, isTerminal } from "@/lib/orderStatus";
import { formatOrderNumber } from "@/lib/orderNumber";
import type { Order } from "@/generated/prisma";

type ReminderKey = "d3" | "d2" | "d0";

interface CartItem {
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
}

interface WindowDef {
  key: ReminderKey;
  daysAway: number;
  headline: string; // e.g. "Today", "In 2 days"
  subjectLabel: string; // e.g. "Today", "In 2 days"
  accent: string; // hex color for header band
  layout: "cards" | "list";
}

const WINDOWS: WindowDef[] = [
  { key: "d3", daysAway: 3, headline: "In 3 days", subjectLabel: "In 3 days", accent: "#A8D8CB", layout: "list" },
  { key: "d2", daysAway: 2, headline: "In 2 days", subjectLabel: "In 2 days", accent: "#8F3550", layout: "list" },
  { key: "d0", daysAway: 0, headline: "Today",     subjectLabel: "Today",     accent: "#B94A64", layout: "cards" },
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

function getItems(o: Order): CartItem[] {
  return Array.isArray(o.items) ? (o.items as unknown as CartItem[]) : [];
}

function itemsSummary(items: CartItem[]): string {
  if (items.length === 0) return "no items";
  const parts = items.slice(0, 2).map((it) => {
    const qty = it.quantity > 1 ? `${it.quantity}× ` : "";
    return `${qty}${it.name}`;
  });
  if (items.length > 2) parts.push(`+${items.length - 2} more`);
  return parts.join(", ");
}

function buildSubject(orders: Order[], window: WindowDef): string {
  if (orders.length === 0) return `${window.subjectLabel}: no orders`;
  const first = orders[0];
  if (orders.length === 1) {
    const items = getItems(first);
    const itemHint = items.length > 0 ? ` — ${items[0].name}${items.length > 1 ? ` +${items.length - 1}` : ""}` : "";
    return `${window.subjectLabel}: ${first.customerName}${itemHint}`;
  }
  const others = orders.length - 1;
  return `${window.subjectLabel}: ${first.customerName} + ${others} more`;
}

function formatPhoneHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function pillStyle(): string {
  return "display:inline-block;background:#FBE3E7;color:#8F3550;padding:4px 10px;border-radius:999px;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;white-space:nowrap;";
}

function kickerStyle(): string {
  return "font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#B94A64;font-weight:700;";
}

function itemsBlock(items: CartItem[], totalPrice: number): string {
  if (items.length === 0) {
    return `<div style="background:#FBF6EE;border-radius:10px;padding:12px 14px;font-size:13px;color:#6B4A3A;font-style:italic;">No items recorded</div>`;
  }
  const rows = items
    .map((it) => {
      const variant = it.variantLabel ? `<div style="font-size:12px;color:#6B4A3A;">${escapeHtml(it.variantLabel)}</div>` : "";
      const flavour = it.flavour ? `<div style="font-size:12px;color:#6B4A3A;">Flavour: ${escapeHtml(it.flavour)}</div>` : "";
      const note = it.note ? `<div style="font-size:12px;color:#6B4A3A;white-space:pre-wrap;">Note: ${escapeHtml(it.note)}</div>` : "";
      return `
        <tr>
          <td style="padding:8px 0;vertical-align:top;border-bottom:1px solid rgba(58,31,24,0.06);">
            <div style="font-weight:600;color:#3A1F18;font-size:14px;">${escapeHtml(it.name)}</div>
            ${variant}${flavour}${note}
          </td>
          <td style="padding:8px 0;vertical-align:top;text-align:right;border-bottom:1px solid rgba(58,31,24,0.06);white-space:nowrap;">
            <div style="font-size:12px;color:#6B4A3A;">×${it.quantity}</div>
            <div style="font-size:14px;color:#3A1F18;font-weight:600;font-family:Georgia,serif;">$${(it.price * it.quantity).toFixed(2)}</div>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div style="background:#FBF6EE;border-radius:10px;padding:14px 16px;">
      <div style="${kickerStyle()};color:#6B4A3A;margin-bottom:8px;">Items</div>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${rows}</table>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr>
          <td style="font-size:12px;color:#6B4A3A;letter-spacing:0.1em;text-transform:uppercase;">Total</td>
          <td style="text-align:right;font-family:Georgia,serif;font-size:18px;font-weight:600;color:#B94A64;">$${Number(totalPrice).toFixed(2)}</td>
        </tr>
      </table>
    </div>
  `;
}

function customerNotesBlock(notes: string | null): string {
  if (!notes) return "";
  return `
    <div style="background:#FBE3E7;border-left:3px solid #B94A64;border-radius:8px;padding:12px 14px;margin-top:12px;">
      <div style="${kickerStyle()};color:#8F3550;margin-bottom:6px;">Customer notes</div>
      <div style="font-size:14px;color:#3A1F18;white-space:pre-wrap;line-height:1.45;">${escapeHtml(notes)}</div>
    </div>
  `;
}

function internalNotesBlock(notes: string | null): string {
  if (!notes) return "";
  return `
    <div style="background:#F4EAD7;border-radius:8px;padding:12px 14px;margin-top:8px;">
      <div style="${kickerStyle()};color:#6B4A3A;margin-bottom:6px;">Your notes</div>
      <div style="font-size:13px;color:#3A1F18;white-space:pre-wrap;line-height:1.45;">${escapeHtml(notes)}</div>
    </div>
  `;
}

function contactRow(o: Order): string {
  const phoneHtml = o.customerPhone
    ? `<a href="tel:${escapeHtml(formatPhoneHref(o.customerPhone))}" style="color:#B94A64;text-decoration:none;font-weight:600;">📞 ${escapeHtml(o.customerPhone)}</a>`
    : "";
  const emailHtml = `<a href="mailto:${escapeHtml(o.customerEmail)}" style="color:#6B4A3A;text-decoration:none;">${escapeHtml(o.customerEmail)}</a>`;
  const sep = phoneHtml ? `<span style="color:rgba(58,31,24,0.3);margin:0 8px;">·</span>` : "";
  return `<div style="font-size:13px;line-height:1.4;">${phoneHtml}${sep}${emailHtml}</div>`;
}

function orderCard(o: Order, baseUrl: string): string {
  const items = getItems(o);
  return `
    <div style="border:1px solid rgba(58,31,24,0.12);border-radius:14px;padding:20px 22px;margin-bottom:14px;background:#FFFFFF;">
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td style="vertical-align:top;">
            <div style="${kickerStyle()};margin-bottom:6px;">${formatOrderNumber(o.orderNumber)}</div>
            <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:#3A1F18;line-height:1.1;">${escapeHtml(o.customerName)}</div>
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap;">
            <span style="${pillStyle()}">${STATUS_LABEL[o.status]}</span>
          </td>
        </tr>
      </table>

      <div style="margin-bottom:14px;">${contactRow(o)}</div>

      ${itemsBlock(items, Number(o.totalPrice))}
      ${customerNotesBlock(o.customerNotes)}
      ${internalNotesBlock(o.internalNotes)}

      <div style="margin-top:16px;">
        <a href="${baseUrl}/admin/orders/${o.id}" style="display:inline-block;background:#B94A64;color:#FFFFFF;padding:11px 22px;border-radius:999px;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">
          Open in admin →
        </a>
      </div>
    </div>
  `;
}

function orderListRow(o: Order, baseUrl: string): string {
  const items = getItems(o);
  const phone = o.customerPhone
    ? `<a href="tel:${escapeHtml(formatPhoneHref(o.customerPhone))}" style="color:#B94A64;text-decoration:none;">${escapeHtml(o.customerPhone)}</a><span style="color:rgba(58,31,24,0.25);margin:0 6px;">·</span>`
    : "";
  const dueDate = o.neededDate
    ? new Date(o.neededDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "No date";

  return `
    <table role="presentation" style="width:100%;border-collapse:collapse;border-bottom:1px solid rgba(58,31,24,0.08);">
      <tr>
        <td style="padding:14px 0;vertical-align:top;">
          <div style="${kickerStyle()};margin-bottom:4px;">${formatOrderNumber(o.orderNumber)} · ${dueDate}</div>
          <div style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#3A1F18;line-height:1.2;margin-bottom:4px;">${escapeHtml(o.customerName)}</div>
          <div style="font-size:13px;color:#6B4A3A;line-height:1.4;">
            ${phone}${escapeHtml(itemsSummary(items))}
          </div>
          ${o.customerNotes ? `<div style="font-size:12px;color:#8F3550;margin-top:4px;font-style:italic;">"${escapeHtml(o.customerNotes.slice(0, 120))}${o.customerNotes.length > 120 ? "…" : ""}"</div>` : ""}
        </td>
        <td style="padding:14px 0;vertical-align:top;text-align:right;white-space:nowrap;">
          <div style="margin-bottom:8px;"><span style="${pillStyle()}">${STATUS_LABEL[o.status]}</span></div>
          <a href="${baseUrl}/admin/orders/${o.id}" style="color:#B94A64;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">Open →</a>
        </td>
      </tr>
    </table>
  `;
}

function reminderHtml(orders: Order[], window: WindowDef, baseUrl: string): string {
  const dateStr = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + window.daysAway);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  })();

  const body =
    window.layout === "cards"
      ? orders.map((o) => orderCard(o, baseUrl)).join("")
      : orders.map((o) => orderListRow(o, baseUrl)).join("");

  const totalDollars = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dip &amp; Sprinkle reminder</title>
</head>
<body style="margin:0;padding:0;background:#FBF6EE;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">
    ${orders.length} order${orders.length === 1 ? "" : "s"} · ${escapeHtml(dateStr)} · $${totalDollars.toFixed(2)}
  </div>
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#FBF6EE;">
    <tr><td style="padding:32px 16px;">
      <table role="presentation" style="width:100%;max-width:640px;margin:0 auto;border-collapse:collapse;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid rgba(58,31,24,0.08);">
        <tr>
          <td style="background:${window.accent};padding:28px 30px;color:#FFFFFF;">
            <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;opacity:0.85;font-weight:700;margin-bottom:10px;">Dip &amp; Sprinkle</div>
            <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:400;margin:0;font-size:32px;line-height:1.05;color:#FFFFFF;">
              ${window.headline}
            </h1>
            <p style="margin:10px 0 0;font-size:14px;opacity:0.95;color:#FFFFFF;">
              ${escapeHtml(dateStr)} · ${orders.length} order${orders.length === 1 ? "" : "s"}${totalDollars > 0 ? ` · <span style="font-family:Georgia,serif;font-weight:600;">$${totalDollars.toFixed(2)}</span>` : ""}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:${window.layout === "cards" ? "26px 26px 12px" : "8px 30px 16px"};background:#FFFFFF;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 30px;background:#F4EAD7;border-top:1px solid rgba(58,31,24,0.08);text-align:center;font-size:12px;color:#6B4A3A;">
            Daily reminder &middot; <a href="${baseUrl}/admin" style="color:#B94A64;text-decoration:none;font-weight:700;">Open admin →</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

  const force = req.nextUrl.searchParams.get("force") === "1";

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
        ...(force ? {} : { NOT: { remindersSent: { has: w.key } } }),
      },
      orderBy: { createdAt: "asc" },
    });

    const actionable = orders.filter((o) => !isTerminal(o.status));
    if (actionable.length === 0) continue;

    try {
      await resend.emails.send({
        from,
        to: "supportdipsprinkle@gmail.com",
        subject: `${force ? "[TEST] " : ""}${buildSubject(actionable, w)}`,
        html: reminderHtml(actionable, w, baseUrl),
      });
      if (!force) {
        await Promise.all(
          actionable.map((o) =>
            prisma.order.update({
              where: { id: o.id },
              data: { remindersSent: { push: w.key } },
            })
          )
        );
      }
      summary[w.key] = actionable.length;
    } catch (err) {
      console.error(`Reminder send failed for ${w.key}:`, err);
    }
  }

  return NextResponse.json({ ok: true, summary, force });
}
