import { NextResponse } from "next/server";
import { registerOrganizationUseCase } from "@/shared/container";
import { apiError } from "@/shared/http/api-error";
import { readJsonBody } from "@/shared/http/read-json-body";
import { InvalidJsonError, ValidationError } from "@/shared/errors/app-errors";
import { EmailAlreadyRegisteredError } from "@/modules/auth/domain/errors";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const account = await registerOrganizationUseCase.execute(body);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidJsonError) {
      return apiError(400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    if (error instanceof ValidationError) {
      return apiError(400, "VALIDATION_FAILED", "Some fields are invalid.", error.fieldErrors);
    }

    if (error instanceof EmailAlreadyRegisteredError) {
      return apiError(409, "EMAIL_ALREADY_REGISTERED", "An account with this email already exists.");
    }

    // Log the error type only. Never log the request body, which contains a password.
    console.error("Registration failed:", error instanceof Error ? error.name : "unknown error");

    return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}