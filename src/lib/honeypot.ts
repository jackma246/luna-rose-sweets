/**
 * Hidden form field that people never see or fill but form-filling bots do. Requests that fill it are
 * answered with a normal-looking success and then dropped (nothing stored, nothing emailed).
 */
export const HONEYPOT_FIELD = "website";

export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null && value !== false;
}
