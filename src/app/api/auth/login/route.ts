import { NextResponse } from "next/server";

import { createSessionToken, verifyCredentials } from "@/lib/auth";
import {
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { checkRequestRateLimit } from "@/app/api/shared/rateLimitShared";
import { loginSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRequestRateLimit(
      request,
      "login",
      5,
      15 * 60 * 1000,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await parseJsonBody(request);
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const { email, password } = result.data;
    const user = await verifyCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const { token, maxAgeSeconds } = createSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set("taskboard_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSeconds,
      path: "/",
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
