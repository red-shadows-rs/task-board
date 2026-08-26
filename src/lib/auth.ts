import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

import {
  getAuthUserByEmail,
  getAuthUserById,
  getProjectById,
  isProjectMember,
} from "@/lib/db";
import { HttpError } from "@/app/api/shared/responseShared";

import type { Project, User, UserRole } from "@/types";

const SESSION_COOKIE = "taskboard_session";
const SESSION_TTL_MS = 60 * 60 * 24 * 7 * 1000;

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required. Set a strong random secret in .env.local",
  );
}

const DUMMY_HASH =
  "$2a$10$Yh9TOlo/N2B8NfnTU2sZS.CLDbBgDFeqpP1cxaJFjkEUhWSVd4EhC";

function signData(data: string): string {
  return createHmac("sha256", SESSION_SECRET as string)
    .update(data)
    .digest("hex");
}

export function createSessionToken(userId: string): {
  token: string;
  maxAgeSeconds: number;
} {
  const now = Date.now();
  const payload = Buffer.from(
    JSON.stringify({ id: userId, iat: now, exp: now + SESSION_TTL_MS }),
  ).toString("base64url");
  return {
    token: `${signData(payload)}.${payload}`,
    maxAgeSeconds: SESSION_TTL_MS / 1000,
  };
}

export function verifySessionToken(signedValue: string): string | null {
  const firstDot = signedValue.indexOf(".");
  if (firstDot === -1) return null;

  const signature = signedValue.slice(0, firstDot);
  const payload = signedValue.slice(firstDot + 1);

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(signData(payload), "hex");
    if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as { id?: string; iat?: number; exp?: number };

    if (!parsed.id || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;

    const user = getAuthUserById(parsed.id);
    if (!user) return null;

    if (user.passwordChangedAt > (parsed.iat ?? 0)) return null;

    return parsed.id;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = getAuthUserByEmail(email.toLowerCase());

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) return null;

  const {
    passwordHash: _hash,
    passwordChangedAt: _changedAt,
    ...publicUser
  } = user;
  return publicUser;
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    if (!session) return null;

    const userId = verifySessionToken(session.value);
    if (!userId) return null;

    const user = getAuthUserById(userId);
    if (!user) return null;

    const {
      passwordHash: _hash,
      passwordChangedAt: _changedAt,
      ...publicUser
    } = user;
    return publicUser;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  return user;
}

export async function requireLeader(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== "leader") {
    throw new HttpError(403, "Forbidden: leader access required");
  }

  return user;
}

export async function requireRoles(...roles: UserRole[]): Promise<User> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new HttpError(403, "Forbidden: insufficient role");
  }

  return user;
}

export function isLeader(user: User): boolean {
  return user.role === "leader";
}

export function getProjectOrThrow(projectId: string): Project {
  const project = getProjectById(projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }
  return project;
}

export function assertCanReadProject(user: User, project: Project): void {
  if (isLeader(user)) return;
  if (!project.teamMembers.includes(user.id)) {
    throw new HttpError(403, "Forbidden");
  }
}

export function assertCanWriteProject(user: User, project: Project): void {
  if (isLeader(user)) return;
  if (user.role === "client" && project.teamMembers.includes(user.id)) return;
  throw new HttpError(403, "Forbidden");
}

export function canUserReadProject(user: User, project: Project): boolean {
  return isLeader(user) || project.teamMembers.includes(user.id);
}

export function isMemberOfProject(user: User, projectId: string): boolean {
  if (isLeader(user)) return true;
  return isProjectMember(projectId, user.id);
}
