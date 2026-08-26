import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import {
  getProjectOrThrow,
  assertCanWriteProject,
  requireAuth,
} from "@/lib/auth";
import {
  createSection,
  getMaxSectionOrderInProject,
  listSections,
} from "@/lib/db";
import {
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { sectionCreateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;

    const sections = listSections(user, projectId);

    return NextResponse.json({ sections });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await parseJsonBody(request);
    const result = sectionCreateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const project = getProjectOrThrow(result.data.projectId);
    assertCanWriteProject(user, project);

    const maxOrder = getMaxSectionOrderInProject(project.id);

    const section = createSection({
      id: uuidv4(),
      projectId: project.id,
      title: result.data.title,
      order: result.data.order ?? maxOrder + 1,
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
