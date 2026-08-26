import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { requireAuth, requireLeader } from "@/lib/auth";
import { createProject, getUserById, listProjects } from "@/lib/db";
import {
  HttpError,
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { projectCreateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();
    const projects = listProjects(user);

    return NextResponse.json({ projects });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireLeader();

    const body = await parseJsonBody(request);
    const result = projectCreateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const { title, startDate, endDate, status, teamMembers, color, order } =
      result.data;

    for (const memberId of teamMembers) {
      if (!getUserById(memberId)) {
        throw new HttpError(400, "Invalid team member id");
      }
    }

    const allProjects = listProjects();
    const maxOrder = allProjects.reduce(
      (max, p) => Math.max(max, p.order || 0),
      -1,
    );

    const project = createProject({
      id: uuidv4(),
      title,
      startDate: startDate || "",
      endDate: endDate || "",
      status,
      teamMembers,
      color: color || "",
      createdBy: user.id,
      order: order ?? maxOrder + 1,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
