/** Image type detection from file bytes. Pure, so the browser photo picker and the server share it. */

export interface SniffedImage {
  mime: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/heic" | "image/heif";
  ext: ".jpg" | ".png" | ".webp" | ".gif" | ".heic" | ".heif";
}

const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs"]);
const HEIF_BRANDS = new Set(["mif1", "msf1", "heif"]);

function ascii(buf: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...buf.subarray(start, end));
}

/**
 * Identify an image by its magic bytes. The declared MIME type and file name are client-controlled and
 * never trusted: the stored type and the file extension always come from here.
 */
export function sniffImageType(buf: Uint8Array): SniffedImage | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: ".jpg" };
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { mime: "image/png", ext: ".png" };
  }
  if (buf.length >= 6 && (ascii(buf, 0, 6) === "GIF87a" || ascii(buf, 0, 6) === "GIF89a")) return { mime: "image/gif", ext: ".gif" };
  if (buf.length >= 12 && ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP") return { mime: "image/webp", ext: ".webp" };
  if (buf.length >= 12 && ascii(buf, 4, 8) === "ftyp") {
    const brand = ascii(buf, 8, 12);
    if (HEIC_BRANDS.has(brand)) return { mime: "image/heic", ext: ".heic" };
    if (HEIF_BRANDS.has(brand)) return { mime: "image/heif", ext: ".heif" };
  }
  return null;
}
