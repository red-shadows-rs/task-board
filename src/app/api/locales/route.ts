import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCALES_DIR = path.join(process.cwd(), "public", "locales");

async function getLocaleDirectories(
  dir: string,
  baseDir: string = "",
): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  let directories: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? path.join(baseDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      const [hasEn, hasAr] = await Promise.all([
        fileExists(path.join(fullPath, "enLocale.json")),
        fileExists(path.join(fullPath, "arLocale.json")),
      ]);

      if (hasEn || hasAr) {
        directories.push(relativePath.replace(/\\/g, "/"));
      }

      directories = directories.concat(
        await getLocaleDirectories(fullPath, relativePath),
      );
    }
  }

  return directories;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const paths = await getLocaleDirectories(LOCALES_DIR);
    return NextResponse.json(paths, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to scan locales" },
      { status: 500 },
    );
  }
}
