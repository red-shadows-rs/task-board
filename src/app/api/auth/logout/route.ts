import { NextResponse } from "next/server";

import { logout } from "@/lib/auth";
import { errorResponse } from "@/app/api/shared/responseShared";

export async function POST() {
  try {
    await logout();
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
