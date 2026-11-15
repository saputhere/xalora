import { NextRequest, NextResponse } from "next/server";
import { logoutUserUseCase } from "@/shared/container";
import { apiError } from "@/shared/http/api-error";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/shared/http/session-cookie";

export async function POST(request: NextRequest) {
  try {
    await logoutUserUseCase.execute(request.cookies.get(SESSION_COOKIE_NAME)?.value);

    const response = new NextResponse(null, { status: 204 });
    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Logout failed:", error instanceof Error ? error.name : "unknown error");

    return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}