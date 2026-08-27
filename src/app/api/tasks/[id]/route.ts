import { NextResponse } from "next/server";

import { getProjectOrThrow, isLeader, requireAuth } from "@/lib/auth";
import {
  cleanupAttachmentFiles,
  deleteTask,
  getSectionById,
  getTaskById,
  updateTaskFields,
} from "@/lib/db";
import {
  HttpError,
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { taskUpdateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";
import type { Task, User } from "@/types";

function assertCanReadTask(user: User, task: Task): void {
  if (isLeader(user)) return;

  const project = getProjectOrThrow(getTaskProjectIdOrThrow(task));

  if (user.role === "client") {
    if (!project.teamMembers.includes(user.id)) {
      throw new HttpError(403, "Forbidden");
    }
    return;
  }

  if (!task.assignedTo.includes(user.id)) {
    throw new HttpError(403, "Forbidden");
  }
}

function getTaskProjectIdOrThrow(task: Task): string {
  const section = getSectionById(task.sectionId);
  if (!section) {
    throw new HttpError(404, "Section not found");
  }
  return section.projectId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const task = getTaskById(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    assertCanReadTask(user, task);

    return NextResponse.json({
      task:
        isLeader(user) || !task.assigneePrices?.length
          ? task
          : { ...task, assigneePrices: [] },
    });
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

    const existingTask = getTaskById(id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(getTaskProjectIdOrThrow(existingTask));
    const body = await parseJsonBody(request);

    if (user.role === "member") {
      if (!existingTask.assignedTo.includes(user.id)) {
        throw new HttpError(403, "Forbidden");
      }

      const allowedKeys = ["status"];
      if (Object.keys(body).some((key) => !allowedKeys.includes(key))) {
        throw new HttpError(403, "Members can only update task status");
      }

      const result = taskUpdateSchema.safeParse(body);
      if (!result.success) {
        return zodErrorResponse(result.error);
      }

      if (result.data.status === "done") {
        throw new HttpError(403, "Only leaders and clients can complete tasks");
      }

      const { task, removedAttachments } = updateTaskFields(id, {
        status: result.data.status,
      });
      cleanupAttachmentFiles(removedAttachments);

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      return NextResponse.json({
        task: task.assigneePrices?.length
          ? { ...task, assigneePrices: [] }
          : task,
      });
    }

    if (user.role === "client" && !project.teamMembers.includes(user.id)) {
      throw new HttpError(403, "Forbidden");
    }

    const result = taskUpdateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const updates = { ...result.data };

    if (updates.attachments) {
      const knownPaths = new Set(existingTask.attachments);
      if (updates.attachments.some((p) => !knownPaths.has(p))) {
        throw new HttpError(400, "Unknown attachment path");
      }
    }

    if (user.role === "client") {
      delete updates.assigneePrices;
      if (updates.sectionId) {
        const targetSection = getSectionById(updates.sectionId);
        if (!targetSection || targetSection.projectId !== project.id) {
          throw new HttpError(400, "Target section is outside this project");
        }
      }
    }

    const { task, removedAttachments } = updateTaskFields(id, {
      sectionId: updates.sectionId,
      title: updates.title,
      description: updates.description,
      status: updates.status,
      assignedTo: updates.assignedTo,
      dueDate: updates.dueDate,
      priority: updates.priority,
      tags: updates.tags,
      order: updates.order,
      attachments: updates.attachments,
      assigneePrices:
        user.role === "leader" ? updates.assigneePrices : undefined,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    cleanupAttachmentFiles(removedAttachments);

    return NextResponse.json({
      task:
        isLeader(user) || !task.assigneePrices?.length
          ? task
          : { ...task, assigneePrices: [] },
    });
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

    const task = getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(getTaskProjectIdOrThrow(task));

    if (user.role === "member") {
      throw new HttpError(403, "Forbidden");
    }

    if (!isLeader(user) && !project.teamMembers.includes(user.id)) {
      throw new HttpError(403, "Forbidden");
    }

    const { deleted, attachments } = deleteTask(id);

    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    cleanupAttachmentFiles(attachments);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
