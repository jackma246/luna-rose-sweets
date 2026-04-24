import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

interface CartItem {
  name: string;
  variantLabel: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
  neededDate?: string;
  message?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function buildItemRows(items: CartItem[]): string {
  return items
    .map((item) => {
      const name = escapeHtml(item.name);
      const variant = escapeHtml(item.variantLabel);
      let row = `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;">${name}<br/><span style="color:#999;font-size:12px;">${variant}</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
      if (item.flavour) {
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Flavour: ${escapeHtml(item.flavour)}</td></tr>`;
      }
      if (item.note) {
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Details: ${escapeHtml(item.note)}</td></tr>`;
      }
      return row;
    })
    .join("");
}

function itemsTable(items: CartItem[], totalPrice: number, totalLabel: string): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#faf9f7;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Price</th>
        </tr>
      </thead>
      <tbody>${buildItemRows(items)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:14px 12px;font-weight:700;">${totalLabel}</td>
          <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:18px;color:#c05;">$${Number(totalPrice).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function detailsBlock(rows: Array<[string, string]>): string {
  if (rows.length === 0) return "";
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 14px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;width:110px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:10px 14px;white-space:pre-wrap;">${value}</td></tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#faf9f7;border-radius:8px;overflow:hidden;">${body}</table>`;
}

function supportEmail(customer: Customer, items: CartItem[], totalPrice: number, neededDateLabel?: string): string {
  const rows: Array<[string, string]> = [
    ["Name", `<strong>${escapeHtml(customer.name)}</strong>`],
    ["Email", `<a href="mailto:${escapeHtml(customer.email)}" style="color:#c05;text-decoration:none;">${escapeHtml(customer.email)}</a>`],
  ];
  if (customer.phone) rows.push(["Phone", escapeHtml(customer.phone)]);
  if (neededDateLabel) rows.push(["Needed by", escapeHtml(neededDateLabel)]);
  if (customer.message) rows.push(["Notes", escapeHtml(customer.message)]);

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">New Order Request</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Dip &amp; Sprinkle</p>
      </div>
      <div style="padding:32px;">
        ${detailsBlock(rows)}
        ${itemsTable(items, totalPrice, "Estimated total")}
        <p style="margin:0;font-size:13px;color:#999;border-top:1px solid #f0ebe4;padding-top:16px;">
          Reply to this email to reach the customer directly at <strong>${escapeHtml(customer.email)}</strong>.
        </p>
      </div>
    </div>
  `;
}

function customerEmail(customer: Customer, items: CartItem[], totalPrice: number, neededDateLabel?: string): string {
  const detailsRows: Array<[string, string]> = [];
  if (neededDateLabel) detailsRows.push(["Needed by", escapeHtml(neededDateLabel)]);
  if (customer.message) detailsRows.push(["Your notes", escapeHtml(customer.message)]);

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your order is pending review</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Dip &amp; Sprinkle</p>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(customer.name.split(" ")[0] || customer.name)},
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
          Thanks for your request! We&rsquo;ve received the order below and will email you back within <strong>24 hours</strong> to confirm availability, pickup or delivery, and payment details.
        </p>
        ${detailsRows.length > 0 ? detailsBlock(detailsRows) : ""}
        ${itemsTable(items, totalPrice, "Estimated total")}
        <p style="margin:0 0 8px;font-size:13px;color:#777;line-height:1.6;">
          The total above is an <em>estimate</em> — we&rsquo;ll confirm the final amount (including any delivery) before taking payment.
        </p>
        <p style="margin:0;font-size:13px;color:#999;border-top:1px solid #f0ebe4;padding-top:16px;">
          Questions? Just reply to this email or message <a href="https://www.instagram.com/dipsprinkle" style="color:#c05;text-decoration:none;">@dipsprinkle</a> on Instagram.
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const { items, totalPrice, customer } = (await req.json()) as {
    items: CartItem[];
    totalPrice: number;
    customer: Customer;
  };

  if (!customer?.name || !customer?.email) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json({ ok: false, error: "Email service not configured." }, { status: 500 });
  }

  const neededDateLabel = formatDate(customer.neededDate);
  const resend = new Resend(apiKey);
  const from = "Dip & Sprinkle <orders@dipsprinkle.com>";
  const priceStr = Number(totalPrice).toFixed(2);

  try {
    await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || null,
        items: items as unknown as object[],
        totalPrice,
        neededDate: customer.neededDate ? new Date(customer.neededDate + "T00:00:00") : null,
        customerNotes: customer.message || null,
        status: "pending",
      },
    });
  } catch (err) {
    console.error("Failed to persist order:", err);
    // Fall through — we still want to send emails even if DB write fails,
    // so the order isn't lost. Owner can backfill manually via /admin/orders/new.
  }

  try {
    const [support, confirmation] = await Promise.all([
      resend.emails.send({
        from,
        to: "supportdipsprinkle@gmail.com",
        replyTo: customer.email,
        subject: `New Order Request — ${customer.name} — $${priceStr}`,
        html: supportEmail(customer, items, totalPrice, neededDateLabel),
      }),
      resend.emails.send({
        from,
        to: customer.email,
        replyTo: "supportdipsprinkle@gmail.com",
        subject: `Your Dip & Sprinkle order is pending — $${priceStr}`,
        html: customerEmail(customer, items, totalPrice, neededDateLabel),
      }),
    ]);

    if (support.error || confirmation.error) {
      console.error("Email send error:", support.error, confirmation.error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
