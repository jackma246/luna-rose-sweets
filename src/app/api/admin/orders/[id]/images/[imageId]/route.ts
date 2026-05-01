import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { orderUploadDir } from "@/lib/imageStorage";
import { isAuthResponse, requireAdmin, requireSunjaeDeleteConfirmation } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

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
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const { id, imageId } = await params;
  const confirmation = requireSunjaeDeleteConfirmation(req, actor, "order image", imageId);
  if (confirmation) return confirmation;
  const image = await prisma.orderImage.findUnique({ where: { id: imageId } });
  if (!image || image.orderId !== id) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.orderImage.delete({ where: { id: imageId } });
    await logAdminWriteWithClient(tx, {
      actor,
      method: req.method,
      path: req.nextUrl.pathname,
      action: "order_image.delete",
      targetType: "order_image",
      targetId: imageId,
      responseJson: { id: imageId, orderId: id },
      ok: true,
    });
  });

  const target = path.join(orderUploadDir(id), image.filename);
  try {
    await unlink(target);
  } catch {
    // Soft-fail: row is already gone, treat missing file as already-deleted.
  }

  return NextResponse.json({ ok: true });
}
