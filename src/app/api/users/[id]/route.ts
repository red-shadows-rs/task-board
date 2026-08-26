import { NextResponse } from "next/server";

import {
  hashPassword,
  requireAuth,
  requireLeader,
  verifyPassword,
} from "@/lib/auth";
import {
  countLeaders,
  deleteUser,
  getAuthUserById,
  getUserById,
  updateUserFields,
  UniqueConstraintError,
} from "@/lib/db";
import {
  HttpError,
  errorResponse,
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/shared/responseShared";
import {
  userAdminUpdateSchema,
  userSelfUpdateSchema,
} from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";
import type { User } from "@/types";

function stripPassword(user: User): Omit<User, "password"> {
  const { password: _password, ...rest } = user as User & { password?: string };
  return rest;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    const user = getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "leader" && currentUser.id !== id) {
      throw new HttpError(403, "Forbidden");
    }

    return NextResponse.json({ user: stripPassword(user) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    const isSelf = currentUser.id === id;
    const body = await parseJsonBody(request);

    const target = getAuthUserById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (isSelf) {
      const result = userSelfUpdateSchema.safeParse(body);
      if (!result.success) {
        return zodErrorResponse(result.error);
      }

      const { name, email, password, currentPassword } = result.data;

      if (password) {
        if (!currentPassword) {
          throw new HttpError(400, "Current password is required");
        }
        const isValid = await verifyPassword(
          currentPassword,
          target.passwordHash,
        );
        if (!isValid) {
          throw new HttpError(400, "Current password is incorrect");
        }
      }

      let updated;
      try {
        updated = updateUserFields(id, {
          name,
          email: email ? email.toLowerCase() : undefined,
          passwordHash: password ? await hashPassword(password) : undefined,
          passwordChanged: Boolean(password),
        });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new HttpError(409, "A user with this email already exists");
        }
        throw error;
      }

      if (!updated) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: stripPassword(updated) });
    }

    await requireLeader();

    const result = userAdminUpdateSchema.safeParse(body);
    if (!result.success) {
      return zodErrorResponse(result.error);
    }

    const { name, email, password, role, order } = result.data;

    if (role && role !== target.role && target.role === "leader") {
      if (countLeaders() <= 1) {
        throw new HttpError(400, "Cannot change the role of the last leader");
      }
    }

    let updated;
    try {
      updated = updateUserFields(id, {
        name,
        email: email ? email.toLowerCase() : undefined,
        passwordHash: password ? await hashPassword(password) : undefined,
        passwordChanged: Boolean(password),
        role,
        order,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new HttpError(409, "A user with this email already exists");
      }
      throw error;
    }

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: stripPassword(updated) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireLeader();
    const { id } = await params;

    if (currentUser.id === id) {
      throw new HttpError(400, "You cannot delete your own account");
    }

    const target = getAuthUserById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "leader" && countLeaders() <= 1) {
      throw new HttpError(400, "Cannot delete the last leader");
    }

    deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
