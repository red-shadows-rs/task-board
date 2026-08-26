import { NextResponse } from "next/server";

import { getProjectOrThrow, isLeader, requireAuth } from "@/lib/auth";
import { getSectionById, getTaskById, reorderTasks } from "@/lib/db";
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

    if (user.role === "member") {
      throw new HttpError(403, "Forbidden");
    }

    const body = await parseJsonBody(request);
    const result = reorderBodySchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const updates = result.data.updates.map((update) => {
      const task = getTaskById(update.id);
      if (!task) {
        throw new HttpError(404, "Task not found");
      }

      const taskSection = getSectionById(task.sectionId);
      if (!taskSection) {
        throw new HttpError(404, "Section not found");
      }
      const taskProject = getProjectOrThrow(taskSection.projectId);

      if (!isLeader(user) && !taskProject.teamMembers.includes(user.id)) {
        throw new HttpError(403, "Forbidden");
      }

      if (update.sectionId) {
        const targetSection = getSectionById(update.sectionId);
        if (!targetSection) {
          throw new HttpError(404, "Target section not found");
        }
        if (!isLeader(user) && targetSection.projectId !== taskProject.id) {
          throw new HttpError(400, "Target section is outside this project");
        }
      }

      return {
        id: update.id,
        order: update.order,
        sectionId: update.sectionId,
      };
    });

    reorderTasks(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
