import { formatLongDateKey, isDateKey } from "@/lib/businessDate";

/** Photo metadata kept on a stored order line. The bytes live on disk as an OrderImage, never in the JSON. */
export interface InspirationImage {
  name: string;
  type: string;
  size: number;
  /** OrderImage.id of the stored file, when it was saved. */
  imageId?: string;
}

/** An order line as stored in Order.items and rendered in emails. */
export interface CartItem {
  productSlug?: string;
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
  selection?: unknown;
  inspirationImages?: InspirationImage[];
}

export interface Adjustment {
  label: string;
  amount: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string | null;
  neededDate?: string;
  message?: string | null;
}

export const ORDERS_FROM = "Dip & Sprinkle <orders@dipsprinkle.com>";
export const SUPPORT_TO = "supportdipsprinkle@gmail.com";

/**
 * Escape any value for HTML text or attribute context. Accepts unknown on purpose: order JSON can be
 * edited by admins and old rows may hold anything, so templates must never assume a string.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Finite number or 0 - every number interpolated into email HTML goes through this. */
export function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function money(value: unknown): string {
  return num(value).toFixed(2);
}

/** "Saturday, September 5, 2026" for a YYYY-MM-DD date. Never shifts with the server's time zone. */
export function formatLongDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  return isDateKey(iso) ? formatLongDateKey(iso) : undefined;
}

function buildItemRows(items: CartItem[]): string {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const name = escapeHtml(item.name);
      const variant = item.variantLabel ? escapeHtml(item.variantLabel) : "";
      let row = `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;">${name}${variant ? `<br/><span style="color:#999;font-size:12px;">${variant}</span>` : ""}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:center;">${num(item.quantity)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:right;">$${money(num(item.price) * num(item.quantity))}</td>
        </tr>`;
      if (item.flavour) {
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Flavour: ${escapeHtml(item.flavour)}</td></tr>`;
      }
      if (item.note) {
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Details: ${escapeHtml(item.note)}</td></tr>`;
      }
      if (Array.isArray(item.inspirationImages) && item.inspirationImages.length > 0) {
        const names = item.inspirationImages.map((img) => escapeHtml(img?.name)).join(", ");
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Inspiration photos: ${names}</td></tr>`;
      }
      return row;
    })
    .join("");
}

function buildAdjustmentRows(adjustments: Adjustment[]): string {
  if (!Array.isArray(adjustments) || adjustments.length === 0) return "";
  return adjustments
    .map((adj) => {
      const amount = num(adj.amount);
      const sign = amount < 0 ? "−" : "";
      const amt = money(Math.abs(amount));
      return `
        <tr>
          <td colspan="2" style="padding:8px 12px;border-bottom:1px solid #f0ebe4;color:#555;">${escapeHtml(adj.label || "Adjustment")}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:right;color:${amount < 0 ? "#0a8" : "#555"};">${sign}$${amt}</td>
        </tr>`;
    })
    .join("");
}

export function itemsTable(items: CartItem[], adjustments: Adjustment[], totalPrice: number, totalLabel: string): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#faf9f7;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Price</th>
        </tr>
      </thead>
      <tbody>${buildItemRows(items)}${buildAdjustmentRows(adjustments)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:14px 12px;font-weight:700;">${escapeHtml(totalLabel)}</td>
          <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:18px;color:#c05;">$${money(totalPrice)}</td>
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
        `<tr><td style="padding:10px 14px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;width:110px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:10px 14px;white-space:pre-wrap;">${value}</td></tr>` // value: pre-escaped HTML built by the callers below
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#faf9f7;border-radius:8px;overflow:hidden;">${body}</table>`;
}

export function supportEmail(
  customer: CustomerInfo,
  items: CartItem[],
  adjustments: Adjustment[],
  totalPrice: number,
  orderNumberLabel: string | undefined,
  neededDateLabel?: string,
  headerOverride?: string,
): string {
  const rows: Array<[string, string]> = [];
  if (orderNumberLabel) rows.push(["Order #", `<strong>${escapeHtml(orderNumberLabel)}</strong>`]);
  rows.push(["Name", `<strong>${escapeHtml(customer.name)}</strong>`]);
  rows.push(["Email", `<a href="mailto:${escapeHtml(customer.email)}" style="color:#c05;text-decoration:none;">${escapeHtml(customer.email)}</a>`]);
  if (customer.phone) rows.push(["Phone", escapeHtml(customer.phone)]);
  if (neededDateLabel) rows.push(["Needed by", escapeHtml(neededDateLabel)]);
  if (customer.message) rows.push(["Notes", escapeHtml(customer.message)]);

  const heading = headerOverride || "New Order Request";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">${escapeHtml(heading)}${orderNumberLabel ? ` · ${escapeHtml(orderNumberLabel)}` : ""}</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Dip &amp; Sprinkle</p>
      </div>
      <div style="padding:32px;">
        ${detailsBlock(rows)}
        ${itemsTable(items, adjustments, totalPrice, "Estimated total")}
        <p style="margin:0;font-size:13px;color:#999;border-top:1px solid #f0ebe4;padding-top:16px;">
          Reply to this email to reach the customer directly at <strong>${escapeHtml(customer.email)}</strong>.
        </p>
      </div>
    </div>
  `;
}

export function customerConfirmEmail(
  customer: CustomerInfo,
  items: CartItem[],
  adjustments: Adjustment[],
  totalPrice: number,
  orderNumberLabel: string | undefined,
  neededDateLabel?: string,
): string {
  const detailsRows: Array<[string, string]> = [];
  if (orderNumberLabel) detailsRows.push(["Order #", `<strong>${escapeHtml(orderNumberLabel)}</strong>`]);
  if (neededDateLabel) detailsRows.push(["Needed by", escapeHtml(neededDateLabel)]);
  if (customer.message) detailsRows.push(["Your notes", escapeHtml(customer.message)]);

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your order is pending review</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Dip &amp; Sprinkle${orderNumberLabel ? ` · ${escapeHtml(orderNumberLabel)}` : ""}</p>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(String(customer.name ?? "").split(" ")[0] || customer.name)},
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
          Thanks for your request! We&rsquo;ve received the order below and will email you back within <strong>24 hours</strong> to confirm availability, pickup or delivery, and payment details.
        </p>
        ${detailsRows.length > 0 ? detailsBlock(detailsRows) : ""}
        ${itemsTable(items, adjustments, totalPrice, "Estimated total")}
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
