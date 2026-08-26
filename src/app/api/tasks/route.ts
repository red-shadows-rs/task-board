import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import {
  assertCanWriteProject,
  getProjectOrThrow,
  isLeader,
  requireAuth,
} from "@/lib/auth";
import {
  createTask,
  getMaxTaskOrderInSection,
  getSectionById,
  listTasks,
  recomputeProjectEndDate,
} from "@/lib/db";
import {
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { taskCreateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";
import type { Task } from "@/types";

function stripPrices(tasks: Task[]): Task[] {
  return tasks.map((task) =>
    task.assigneePrices && task.assigneePrices.length > 0
      ? { ...task, assigneePrices: [] }
      : task,
  );
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;

    const tasks = listTasks(user, { sectionId, projectId });

    return NextResponse.json({
      tasks: isLeader(user) ? tasks : stripPrices(tasks),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await parseJsonBody(request);
    const result = taskCreateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const section = getSectionById(result.data.sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const project = getProjectOrThrow(section.projectId);
    assertCanWriteProject(user, project);

    const maxOrder = getMaxTaskOrderInSection(section.id);

    const task = createTask({
      id: uuidv4(),
      sectionId: section.id,
      title: result.data.title,
      description: result.data.description,
      status: result.data.status ?? "todo",
      assignedTo: result.data.assignedTo,
      assigneePrices: user.role === "leader" ? result.data.assigneePrices : [],
      dueDate: result.data.dueDate || "",
      priority: result.data.priority ?? "medium",
      tags: result.data.tags,
      order: result.data.order ?? maxOrder + 1,
    });

    recomputeProjectEndDate(section.projectId);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
