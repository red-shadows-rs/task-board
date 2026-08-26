import { NextResponse } from "next/server";

import { requireLeader } from "@/lib/auth";
import { reorderUsers } from "@/lib/db";
import {
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { userReorderBodySchema } from "@/app/api/shared/validatorsShared";

export async function POST(request: Request) {
  try {
    await requireLeader();

    const body = await parseJsonBody(request);
    const result = userReorderBodySchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    reorderUsers(
      result.data.updates.map((update) => ({
        id: update.id,
        order: update.order,
      })),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
