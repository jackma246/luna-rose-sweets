import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { orderUploadDir } from "@/lib/imageStorage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id, imageId } = await params;
  const image = await prisma.orderImage.findUnique({ where: { id: imageId } });
  if (!image || image.orderId !== id) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }
  const target = path.join(orderUploadDir(id), image.filename);
  let data: Buffer;
  try {
    data = await readFile(target);
  } catch {
    return NextResponse.json({ ok: false, error: "File missing on disk." }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": image.mimeType || "application/octet-stream",
      "Content-Length": String(data.byteLength),
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id, imageId } = await params;
  const image = await prisma.orderImage.findUnique({ where: { id: imageId } });
  if (!image || image.orderId !== id) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }
  await prisma.orderImage.delete({ where: { id: imageId } });
  const target = path.join(orderUploadDir(id), image.filename);
  try {
    await unlink(target);
  } catch {
    // Soft-fail: row is already gone, treat missing file as already-deleted.
  }
  return NextResponse.json({ ok: true });
}
