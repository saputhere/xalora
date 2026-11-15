import { connection } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionUseCase } from "../container";
import { SESSION_COOKIE_NAME } from "../http/session-cookie";

export async function getCurrentUser() {
  // Marks this render as request-time, so the expiry check uses the real current time.
  await connection();

  const cookieStore = await cookies();
  return resolveSessionUseCase.execute(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}