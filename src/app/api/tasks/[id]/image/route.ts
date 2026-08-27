import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

import { getProjectOrThrow, isLeader, requireAuth } from "@/lib/auth";
import {
  IMAGES_DIR,
  getSectionById,
  getTaskById,
  isPathInsideImagesDir,
  updateTaskFields,
} from "@/lib/db";
import { HttpError, errorResponse } from "@/app/api/shared/responseShared";
import { checkRateLimit } from "@/app/api/shared/rateLimitShared";

import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    const rateLimit = checkRateLimit(user.id, "upload", 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 },
      );
    }

    const { id: taskId } = await params;

    const task = getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const section = getSectionById(task.sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(section.projectId);

    if (
      !isLeader(user) &&
      !(user.role === "client" && project.teamMembers.includes(user.id))
    ) {
      throw new HttpError(403, "Forbidden");
    }

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_FILES = 10;

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 },
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 400 },
        );
      }
      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP`,
          },
          { status: 400 },
        );
      }
    }

    const imagesDir = path.join(IMAGES_DIR, section.projectId, task.sectionId);

    if (!isPathInsideImagesDir(imagesDir)) {
      throw new HttpError(400, "Invalid image path");
    }

    await fs.mkdir(imagesDir, { recursive: true });

    const currentAttachments = task.attachments || [];
    const newAttachments: string[] = [];

    for (const file of files) {
      const fileUuid = uuidv4();
      const filename = `${fileUuid}.webp`;

      const relativePath = path
        .join("images", section.projectId, task.sectionId, filename)
        .replace(/\\/g, "/");
      const fullPath = path.join(imagesDir, filename);

      if (!isPathInsideImagesDir(fullPath)) {
        throw new HttpError(400, "Invalid image path");
      }

      const fileBuffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));
      let buffer: Buffer;

      try {
        buffer = await sharp(fileBuffer, {
          limitInputPixels: 16_000_000,
          failOn: "error",
        })
          .webp({ quality: 90, effort: 6 })
          .toBuffer();
      } catch {
        return NextResponse.json(
          { error: "Could not process image file" },
          { status: 400 },
        );
      }

      await fs.writeFile(fullPath, buffer);
      newAttachments.push(relativePath);
    }

    const updatedAttachments = [...currentAttachments, ...newAttachments];

    const { task: updatedTask } = updateTaskFields(taskId, {
      attachments: updatedAttachments,
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return errorResponse(error);
  }
}
