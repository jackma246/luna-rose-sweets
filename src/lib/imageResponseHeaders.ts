import { ALLOWED_MIME } from "@/lib/imageStorage";

/** ASCII-only, header-safe version of a user-supplied file name. */
export function safeDownloadName(originalName: string | null | undefined, fallback: string): string {
  const base = (originalName || "").split(/[\\/]/).pop() || "";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._ -]+/g, "_")
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+/, "")
    .trim()
    .slice(0, 100);
  return cleaned || fallback;
}

/**
 * Response headers for serving an uploaded order image. The stored MIME type
 * comes from the uploading client, so only known image types are served as
 * such; nosniff stops the browser from guessing, and a sandbox CSP neutralizes
 * the file even if it is opened directly as a document.
 */
export function orderImageHeaders(image: {
  id: string;
  originalName: string | null;
  mimeType: string | null;
}, byteLength: number): Record<string, string> {
  const mime = image.mimeType && ALLOWED_MIME.includes(image.mimeType) ? image.mimeType : "application/octet-stream";
  const disposition = mime === "application/octet-stream" ? "attachment" : "inline";
  const filename = safeDownloadName(image.originalName, `image-${image.id}`);
  return {
    "Content-Type": mime,
    "Content-Length": String(byteLength),
    "Content-Disposition": `${disposition}; filename="${filename}"`,
    "X-Content-Type-Options": "nosniff",
    // Mirrors the CSP next.config.ts sets for this route (config headers win).
    "Content-Security-Policy": "sandbox; frame-ancestors 'none'",
    "Cache-Control": "private, max-age=3600",
  };
}
