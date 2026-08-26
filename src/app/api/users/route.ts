import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { hashPassword, requireAuth, requireLeader } from "@/lib/auth";
import {
  countUsers,
  createUser,
  listUsers,
  listRelatedUsers,
  UniqueConstraintError,
} from "@/lib/db";
import {
  HttpError,
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import { checkRequestRateLimit } from "@/app/api/shared/rateLimitShared";
import { userCreateSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";
import type { User } from "@/types";

function stripPassword(user: User): Omit<User, "password"> {
  const { password: _password, ...rest } = user as User & { password?: string };
  return rest;
}

function stripEmail(user: User): Omit<User, "password"> {
  const {
    password: _password,
    email: _email,
    ...rest
  } = user as User & { password?: string };
  return rest;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    let visible: User[];
    if (currentUser.role === "leader") {
      visible = listUsers();
      return NextResponse.json({
        users: visible.map(stripPassword),
      });
    }

    visible = listRelatedUsers(currentUser.id);
    return NextResponse.json({
      users: visible.map(stripEmail),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const isBootstrap = countUsers() === 0;

    if (!isBootstrap) {
      const rateLimit = checkRequestRateLimit(
        request,
        "user-create",
        20,
        60 * 1000,
      );
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 },
        );
      }
      await requireLeader();
    }

    const body = await parseJsonBody(request);
    const result = userCreateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const { name, email, password } = result.data;
    const role = isBootstrap ? "leader" : result.data.role;

    const hashedPassword = await hashPassword(password);

    let user: User;
    try {
      user = createUser({
        id: uuidv4(),
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new HttpError(409, "A user with this email already exists");
      }
      throw error;
    }

    return NextResponse.json({ user: stripPassword(user) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
