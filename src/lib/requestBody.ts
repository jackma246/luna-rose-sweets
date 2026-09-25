/**
 * Bounded JSON body reading for public endpoints.
 *
 * req.json() buffers whatever the client sends. These helpers reject an oversized body from its
 * Content-Length before reading, and also stop reading a chunked body once it passes the cap.
 */

export type JsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; status: 400 | 413; error: string };

interface BodySource {
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
}

export async function readJsonBody(req: BodySource, maxBytes: number): Promise<JsonBodyResult> {
  const tooLarge = { ok: false as const, status: 413 as const, error: "That request is too large - please attach fewer or smaller photos." };
  const declared = req.headers.get("content-length");
  if (declared !== null) {
    const n = Number(declared);
    if (!Number.isFinite(n) || n < 0) return { ok: false, status: 400, error: "Invalid request." };
    if (n > maxBytes) return tooLarge;
  }
  if (!req.body) return { ok: false, status: 400, error: "Invalid JSON." };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return tooLarge;
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Invalid request." };
  }

  try {
    const text = new TextDecoder().decode(Buffer.concat(chunks));
    return { ok: true, body: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON." };
  }
}
