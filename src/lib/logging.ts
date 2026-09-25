/**
 * Safe error descriptions for server logs.
 *
 * Prisma error messages embed the failing query - including customer names, emails, phone numbers and
 * message text - and raw error objects can carry request payloads. Logs only ever get the error's class,
 * its code (Prisma's P2002 etc.) and the final line of its message, which names the problem without
 * echoing the data.
 */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return typeof err === "string" ? "non-Error thrown" : `non-Error thrown (${typeof err})`;
  const code = (err as { code?: unknown }).code;
  const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
  const reason = (lines[lines.length - 1] ?? "").slice(0, 300);
  return [err.name, typeof code === "string" ? code : null].filter(Boolean).join(" ") + (reason ? `: ${reason}` : "");
}
