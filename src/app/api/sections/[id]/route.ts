import { NextResponse } from "next/server";

import {
  assertCanReadProject,
  assertCanWriteProject,
  getProjectOrThrow,
  requireAuth,
} from "@/lib/auth";
import {
  cleanupAttachmentFiles,
  deleteSection,
  getSectionById,
  updateSectionFields,
} from "@/lib/db";
import {
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { sectionUpdateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const section = getSectionById(id);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(section.projectId);
    assertCanReadProject(user, project);

    return NextResponse.json({ section });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existingSection = getSectionById(id);
    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(existingSection.projectId);
    assertCanWriteProject(user, project);

    const body = await parseJsonBody(request);
    const result = sectionUpdateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const section = updateSectionFields(id, {
      title: result.data.title,
      order: result.data.order,
    });

    return NextResponse.json({ section });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existingSection = getSectionById(id);
    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(existingSection.projectId);
    assertCanWriteProject(user, project);

    const { deleted, attachments } = deleteSection(id);

    if (!deleted) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    cleanupAttachmentFiles(attachments);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
