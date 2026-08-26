import { NextResponse } from "next/server";

import {
  assertCanReadProject,
  getProjectOrThrow,
  requireAuth,
  requireLeader,
} from "@/lib/auth";
import {
  cleanupAttachmentFiles,
  deleteProject,
  getUserById,
  updateProjectFields,
} from "@/lib/db";
import {
  HttpError,
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { projectUpdateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const project = getProjectOrThrow(id);

    assertCanReadProject(user, project);

    return NextResponse.json({ project });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireLeader();
    const { id } = await params;

    const body = await parseJsonBody(request);
    const result = projectUpdateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const { title, startDate, endDate, status, teamMembers, color, order } =
      result.data;

    if (teamMembers) {
      for (const memberId of teamMembers) {
        if (!getUserById(memberId)) {
          throw new HttpError(400, "Invalid team member id");
        }
      }
    }

    const project = updateProjectFields(id, {
      title,
      startDate,
      endDate,
      status,
      teamMembers,
      color,
      order,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireLeader();
    const { id } = await params;

    const { deleted, attachments } = deleteProject(id);

    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    cleanupAttachmentFiles(attachments);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
