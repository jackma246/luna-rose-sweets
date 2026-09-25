export const DEFAULT_ADMIN_PATH = "/admin";

/**
 * Sanitizes the post-login `next` redirect target. Only same-origin absolute
 * paths are allowed: the value must start with a single "/" (not "//" or "/\",
 * which browsers treat as protocol-relative URLs to another host) and must not
 * contain control characters or whitespace, which browsers strip from URLs
 * (so "/\t/evil.com" would become "//evil.com"). Anything else, including
 * "javascript:" URLs and absolute URLs, falls back to /admin.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_ADMIN_PATH;
  if (!value.startsWith("/")) return DEFAULT_ADMIN_PATH;
  if (value[1] === "/" || value[1] === "\\") return DEFAULT_ADMIN_PATH;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000- \u007f-\u009f\\]/.test(value)) return DEFAULT_ADMIN_PATH;
  return value;
}
