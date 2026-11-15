import { NextResponse } from "next/server";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | undefined>;
  };
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string[] | undefined>,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message, details } }, { status });
}