import { NextRequest, NextResponse } from "next/server";
import { resolveSessionUseCase } from "@/shared/container";
import { apiError } from "@/shared/http/api-error";
import { SESSION_COOKIE_NAME } from "@/shared/http/session-cookie";

export async function GET(request: NextRequest) {
  const user = await resolveSessionUseCase.execute(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (!user) {
    return apiError(401, "UNAUTHENTICATED", "You must be logged in.");
  }

  return NextResponse.json({ user });
}