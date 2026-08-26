import { NextResponse } from "next/server";

import {
  assertCanWriteProject,
  getProjectOrThrow,
  requireAuth,
} from "@/lib/auth";
import { getSectionById, reorderSections } from "@/lib/db";
import {
  HttpError,
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { reorderBodySchema } from "@/app/api/shared/validatorsShared";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await parseJsonBody(request);
    const result = reorderBodySchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const updates = result.data.updates.map((update) => {
      const section = getSectionById(update.id);
      if (!section) {
        throw new HttpError(404, "Section not found");
      }
      const project = getProjectOrThrow(section.projectId);
      assertCanWriteProject(user, project);
      return { id: update.id, order: update.order };
    });

    reorderSections(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
