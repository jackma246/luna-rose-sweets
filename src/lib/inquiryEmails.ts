import { escapeHtml, formatLongDate } from "@/lib/orderEmails";

export interface InquiryEmailInput {
  name: string;
  email: string;
  eventDate?: Date | string | null;
  guestCount?: string | null;
  message?: string | null;
  source: string;
  createdAt: Date;
}

function formatEventDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  return formatLongDate(value);
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 14px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px;white-space:pre-wrap;">${value}</td>
    </tr>
  `;
}

export function inquirySupportEmail(inquiry: InquiryEmailInput): string {
  const rows = [
    detailRow("Name", `<strong>${escapeHtml(inquiry.name)}</strong>`),
    detailRow("Email", `<a href="mailto:${escapeHtml(inquiry.email)}" style="color:#c05;text-decoration:none;">${escapeHtml(inquiry.email)}</a>`),
  ];
  const eventDate = formatEventDate(inquiry.eventDate);
  if (eventDate) rows.push(detailRow("Event date", escapeHtml(eventDate)));
  if (inquiry.guestCount) rows.push(detailRow("Guest count", escapeHtml(inquiry.guestCount)));
  if (inquiry.message) rows.push(detailRow("Message", escapeHtml(inquiry.message)));
  rows.push(detailRow("Source", escapeHtml(inquiry.source)));
  rows.push(detailRow("Submitted", escapeHtml(inquiry.createdAt.toLocaleString("en-US"))));

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">New Custom Inquiry</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Dip &amp; Sprinkle</p>
      </div>
      <div style="padding:32px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#faf9f7;border-radius:8px;overflow:hidden;">
          ${rows.join("")}
        </table>
        <p style="margin:0;font-size:13px;color:#999;border-top:1px solid #f0ebe4;padding-top:16px;">
          Reply to this email to reach the customer directly at <strong>${escapeHtml(inquiry.email)}</strong>.
        </p>
      </div>
    </div>
  `;
}
