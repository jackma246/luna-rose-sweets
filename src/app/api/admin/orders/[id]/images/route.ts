import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
import { logAdminWriteWithClient } from "@/lib/adminAudit";
import {
  ALLOWED_MIME,
  MAX_IMAGES_PER_ORDER,
  MAX_IMAGE_BYTES,
  extensionFromMime,
  orderUploadDir,
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

  const dir = orderUploadDir(id);
  await mkdir(dir, { recursive: true });

  const staged: Array<{ filename: string; originalName: string; mimeType: string; size: number; target: string }> = [];

  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ ok: false, error: `Unsupported type: ${file.type || "unknown"}` }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, error: `${file.name} is larger than 10 MB.` }, { status: 400 });
    }
    const ext = extensionFromMime(file.type, file.name);
    const filename = `${randomUUID()}${ext}`;
    const target = path.join(dir, filename);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(target, buf);

    staged.push({ filename, originalName: file.name, mimeType: file.type, size: file.size, target });
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
        requestJson: { fileCount: files.length, files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })) },
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
