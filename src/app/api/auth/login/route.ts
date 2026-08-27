import { NextResponse } from "next/server";

import {
  API_CLIENT_HEADER,
  KNOWN_API_CLIENTS,
  createSessionToken,
  verifyCredentials,
} from "@/lib/auth";
import {
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import {
  checkRateLimit,
  checkRequestRateLimit,
} from "@/app/api/shared/rateLimitShared";
import { loginSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const { email, password } = result.data;

    const accountLimit = checkRateLimit(
      email.toLowerCase(),
      "login-account",
      10,
      15 * 60 * 1000,
    );
    if (!accountLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const ipLimit = checkRequestRateLimit(request, "login", 20, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const user = await verifyCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const { token, maxAgeSeconds } = createSessionToken(user.id);

    const apiClient = request.headers.get(API_CLIENT_HEADER);
    const isExternalApiClient = (
      KNOWN_API_CLIENTS as readonly string[]
    ).includes(apiClient ?? "");

    const response = NextResponse.json({
      success: true,
      user,
      ...(isExternalApiClient ? { sessionToken: token } : {}),
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
