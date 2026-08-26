import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    await requireAuth();
    const { path: pathArray } = await params;

    const baseDir = path.resolve(process.cwd(), "public", "images");
    const filePath = path.resolve(baseDir, ...pathArray);

    if (!filePath.startsWith(baseDir + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    if (!stats.isFile()) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (_error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
