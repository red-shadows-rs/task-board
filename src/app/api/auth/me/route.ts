import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { errorResponse } from "@/app/api/shared/responseShared";

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
