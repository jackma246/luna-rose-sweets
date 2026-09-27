import { prisma } from "@/lib/prisma";
import type { AdminActor } from "@/lib/adminAuth";

type AuditClient = Pick<typeof prisma, "adminAuditLog">;

export type AdminAuditInput = {
  actor: AdminActor;
  method: string;
  path: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  requestJson?: unknown;
  responseJson?: unknown;
  ok: boolean;
};

export const REDACTED = "[redacted]";

// Keys whose values are customer PII or free text that routinely contains it.
const PII_KEY = /(email|phone|name|address|notes?|message)$/i;
// Keys that carry raw image bytes or encoded file content.
const BINARY_KEY = /^(data|base64|content|bytes|buffer|blob|image|imagedata|file)$/i;
const EMAIL_IN_TEXT = /[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+/g;
// 10+ digits, optionally separated by spaces, dots, dashes or parentheses.
const PHONE_IN_TEXT = /\+?\(?\d(?:[\s().-]*\d){9,}/g;
const MAX_STRING = 500;

function scrubString(value: string): string {
  if (/^data:/i.test(value)) return REDACTED;
  const scrubbed = value.replace(EMAIL_IN_TEXT, REDACTED).replace(PHONE_IN_TEXT, REDACTED);
  return scrubbed.length > MAX_STRING ? `${scrubbed.slice(0, MAX_STRING)}...[truncated]` : scrubbed;
}

/**
 * Strips PII and binary payloads before a request/response body is stored in
 * AdminAuditLog. Keys that name personal data are replaced wholesale; email
 * addresses and phone numbers are also scrubbed from any other string.
 */
export function redactForAudit(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(redactForAudit);

  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    if (inner !== null && inner !== undefined && (PII_KEY.test(key) || BINARY_KEY.test(key))) {
      out[key] = REDACTED;
    } else {
      out[key] = redactForAudit(inner);
    }
  }
  return out;
}

/** Records every admin write, from the browser session and from Sunjae's token alike. */
export async function logAdminWriteWithClient(client: AuditClient, input: AdminAuditInput) {
  await client.adminAuditLog.create({
    data: {
      actorType: input.actor.actorType,
      actorId: input.actor.actorId,
      method: input.method,
      path: input.path,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      requestJson: redactForAudit(input.requestJson) as never,
      responseJson: redactForAudit(input.responseJson) as never,
      ok: input.ok,
    },
  });
}

export async function logAdminWrite(input: AdminAuditInput) {
  await logAdminWriteWithClient(prisma, input);
}
