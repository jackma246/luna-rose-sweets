import { money, num, type CartItem } from "./orderEmails";

export interface OrderInviteInput {
  orderId: string;
  orderNumberLabel: string | undefined;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  neededDate: string; // "YYYY-MM-DD"
  items: CartItem[];
  customerNotes?: string | null;
}

/**
 * Shape accepted by Resend's `attachments`. Resend's API treats a string `content` as base64, so the
 * calendar text must be base64-encoded here - passing the raw ICS text would be decoded into garbage.
 */
export interface IcsAttachment {
  filename: string;
  /** Base64 of the UTF-8 ICS document. */
  content: string;
  contentType: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toDateValue(yyyyMmDd: string): string {
  return yyyyMmDd.replace(/-/g, "");
}

function addOneDay(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
}

function nowStamp(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

// RFC 5545 §3.3.11 — escape commas, semicolons, backslashes; encode newlines as \n
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

const MAX_LINE_OCTETS = 75;
const utf8 = new TextEncoder();

// RFC 5545 section 3.1: content lines are folded at 75 octets (not characters) with CRLF + one space,
// never splitting a multi-byte UTF-8 character. Continuation lines carry the leading space, so they hold
// at most 74 octets of content.
export function foldLine(line: string): string {
  if (utf8.encode(line).length <= MAX_LINE_OCTETS) return line;
  const out: string[] = [];
  let current = "";
  let currentOctets = 0;
  let limit = MAX_LINE_OCTETS;
  for (const ch of line) {
    const size = utf8.encode(ch).length;
    if (currentOctets + size > limit) {
      out.push(current);
      current = "";
      currentOctets = 0;
      limit = MAX_LINE_OCTETS - 1;
    }
    current += ch;
    currentOctets += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

function buildIcs(lines: string[]): string {
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

function buildDescription(input: OrderInviteInput): string {
  const lines: string[] = [];
  if (input.orderNumberLabel) lines.push(`Order: ${input.orderNumberLabel}`);
  lines.push(`Customer: ${input.customerName}`);
  lines.push(`Email: ${input.customerEmail}`);
  if (input.customerPhone) lines.push(`Phone: ${input.customerPhone}`);
  lines.push("");
  lines.push("Items:");
  for (const it of input.items) {
    const variant = it.variantLabel ? ` (${it.variantLabel})` : "";
    lines.push(`• ${num(it.quantity)}× ${it.name}${variant} — $${money(num(it.price) * num(it.quantity))}`);
    if (it.flavour) lines.push(`    Flavour: ${it.flavour}`);
    if (it.note) lines.push(`    Note: ${it.note}`);
  }
  if (input.customerNotes) {
    lines.push("");
    lines.push(`Customer notes: ${input.customerNotes}`);
  }
  return lines.join("\n");
}

export function buildOrderInvite(input: OrderInviteInput): IcsAttachment {
  const dtStart = toDateValue(input.neededDate);
  const dtEnd = addOneDay(input.neededDate);
  const summary = `Send order${input.orderNumberLabel ? ` ${input.orderNumberLabel}` : ""} — ${input.customerName}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dip & Sprinkle//Order Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:order-${input.orderId}@dipsprinkle.com`,
    `DTSTAMP:${nowStamp()}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(buildDescription(input))}`,
    `ORGANIZER;CN=Dip & Sprinkle:mailto:orders@dipsprinkle.com`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const filename = input.orderNumberLabel
    ? `order-${input.orderNumberLabel.replace(/[^a-zA-Z0-9]+/g, "")}.ics`
    : `order-${input.orderId}.ics`;

  return {
    filename,
    content: Buffer.from(buildIcs(lines), "utf8").toString("base64"),
    contentType: "text/calendar; method=REQUEST; charset=utf-8",
  };
}
