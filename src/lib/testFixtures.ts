/** Small valid image payloads for tests (magic bytes only - enough for type sniffing). */
export const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
export const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46]);
export const pngDataUrl = (bytes: Buffer = PNG_BYTES) => `data:image/png;base64,${bytes.toString("base64")}`;
export const HTML_DATA_URL = `data:image/png;base64,${Buffer.from("<html><script>alert(1)</script></html>").toString("base64")}`;
