import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";
import {
  MAX_IMAGES_PER_ORDER,
  MAX_IMAGE_BYTES,
  orderUploadDir,
  safeOriginalName,
  sniffImageType,
} from "@/lib/imageStorage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const { id } = await params;
  const images = await prisma.orderImage.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, images });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin(req);
  if (isAuthResponse(actor)) return actor;

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  const existingCount = await prisma.orderImage.count({ where: { orderId: id } });
  if (existingCount >= MAX_IMAGES_PER_ORDER) {
    return NextResponse.json({ ok: false, error: `Max ${MAX_IMAGES_PER_ORDER} images per order.` }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data." }, { status: 400 });
  }

  const files = formData.getAll("file").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files uploaded." }, { status: 400 });
  }
  if (existingCount + files.length > MAX_IMAGES_PER_ORDER) {
    return NextResponse.json(
      { ok: false, error: `Only ${MAX_IMAGES_PER_ORDER - existingCount} more image(s) allowed.` },
      { status: 400 },
    );
  }

  // Validate every file before writing any, so a bad file in a batch leaves nothing half-uploaded.
  // The type and extension come from the file's bytes, not from the browser's claimed type or name.
  const verified: Array<{ originalName: string; mimeType: string; ext: string; buf: Buffer }> = [];
  for (const file of files) {
    const originalName = safeOriginalName(file.name, "image");
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, error: `${originalName} is larger than 10 MB.` }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageType(buf);
    if (!sniffed) {
      return NextResponse.json(
        { ok: false, error: `${originalName} is not a supported image (JPEG, PNG, WebP, HEIC or GIF).` },
        { status: 400 },
      );
    }
    verified.push({ originalName, mimeType: sniffed.mime, ext: sniffed.ext, buf });
  }

  const dir = orderUploadDir(id);
  await mkdir(dir, { recursive: true });

  const staged: Array<{ filename: string; originalName: string; mimeType: string; size: number; target: string }> = [];
  try {
    for (const file of verified) {
      const filename = `${randomUUID()}${file.ext}`;
      const target = path.join(dir, filename);
      await writeFile(target, file.buf);
      staged.push({ filename, originalName: file.originalName, mimeType: file.mimeType, size: file.buf.byteLength, target });
    }
  } catch (err) {
    await Promise.allSettled(staged.map((file) => unlink(file.target)));
    throw err;
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const rows = [];
      for (const file of staged) {
        const row = await tx.orderImage.create({
          data: {
            orderId: id,
            filename: file.filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
          },
          select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
        });
        rows.push(row);
      }

      await logAdminWriteWithClient(tx, {
        actor,
        method: req.method,
        path: req.nextUrl.pathname,
        action: "order_image.create",
        targetType: "order",
        targetId: id,
        requestJson: { fileCount: staged.length, files: staged.map((f) => ({ name: f.originalName, type: f.mimeType, size: f.size })) },
        responseJson: { imageIds: rows.map((img) => img.id) },
        ok: true,
      });

      return rows;
    });

    return NextResponse.json({ ok: true, images: created });
  } catch (err) {
    await Promise.allSettled(staged.map((file) => unlink(file.target)));
    throw err;
  }
}
