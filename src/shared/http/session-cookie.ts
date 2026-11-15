import type { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "xalora_session";

const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set({
    ...cookieBaseOptions,
    name: SESSION_COOKIE_NAME,
    value: token,
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    ...cookieBaseOptions,
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: new Date(0),
  });
}