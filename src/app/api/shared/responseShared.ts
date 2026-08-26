import { NextResponse } from "next/server";

import type { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function zodErrorResponse(error: ZodError): NextResponse {
  const details = error.errors.map((issue) => ({
    field: issue.path.join(".") || undefined,
    message: issue.message,
  }));

  return NextResponse.json(
    { error: "Invalid input", details },
    { status: 400 },
  );
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function parseJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new HttpError(400, "Invalid JSON body");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Invalid JSON body");
  }
}
