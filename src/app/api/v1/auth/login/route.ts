import { NextResponse } from "next/server";
import { loginUserUseCase } from "@/shared/container";
import { apiError } from "@/shared/http/api-error";
import { readJsonBody } from "@/shared/http/read-json-body";
import { setSessionCookie } from "@/shared/http/session-cookie";
import { InvalidJsonError, ValidationError } from "@/shared/errors/app-errors";
import { InvalidCredentialsError } from "@/modules/auth/domain/errors";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const result = await loginUserUseCase.execute(body);

    const response = NextResponse.json({ user: result.user });
    setSessionCookie(response, result.token, result.expiresAt);

    return response;
  } catch (error) {
    if (error instanceof InvalidJsonError) {
      return apiError(400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    if (error instanceof ValidationError) {
      return apiError(400, "VALIDATION_FAILED", "Some fields are invalid.", error.fieldErrors);
    }

    if (error instanceof InvalidCredentialsError) {
      // The same message for a wrong email and a wrong password.
      return apiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    console.error("Login failed:", error instanceof Error ? error.name : "unknown error");

    return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}