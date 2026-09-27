/**
 * Client-side handling of inspiration photos picked on product pages. The order API re-checks
 * everything (size, count, and the real type from the file bytes); this just stops customers from
 * attaching files that would be rejected.
 */
import { sniffImageType } from "@/lib/imageSniff";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
export const PHOTO_ACCEPT = `${PHOTO_TYPES.join(",")},.heic,.heif`;
export const MAX_PHOTOS_PER_ITEM = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export interface PickedPhoto {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

function isAcceptedPhoto(file: File): boolean {
  return (PHOTO_TYPES.includes(file.type) || (!file.type && /\.(heic|heif)$/i.test(file.name))) && file.size <= MAX_PHOTO_BYTES;
}

/** Checks the file's first bytes, like the server does, so a renamed non-image is caught before ordering. */
async function hasImageBytes(file: File): Promise<boolean> {
  try {
    return sniffImageType(new Uint8Array(await file.slice(0, 16).arrayBuffer())) !== null;
  } catch {
    return false;
  }
}

function readAsDataUrl(file: File): Promise<PickedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Read up to MAX_PHOTOS_PER_ITEM acceptable photos; `message` explains any that were skipped. */
export async function readPickedPhotos(fileList: FileList): Promise<{ photos: PickedPhoto[]; message: string | null }> {
  const all = Array.from(fileList);
  const candidates = all.filter(isAcceptedPhoto);
  const verified = await Promise.all(candidates.map(hasImageBytes));
  const files = candidates.filter((_, i) => verified[i]).slice(0, MAX_PHOTOS_PER_ITEM);
  const skipped = all.length - files.length;
  const photos = await Promise.all(files.map(readAsDataUrl));
  const message =
    skipped > 0
      ? `${skipped} photo${skipped === 1 ? " was" : "s were"} skipped - up to ${MAX_PHOTOS_PER_ITEM} JPEG, PNG, WebP, HEIC or GIF photos, 10 MB each.`
      : null;
  return { photos, message };
}
