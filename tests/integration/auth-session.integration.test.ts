import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as logout } from "@/app/api/v1/auth/logout/route";
import { GET as me } from "@/app/api/v1/auth/me/route";
import { db } from "@/shared/db/client";
import { sessions } from "@/shared/db/schema";
import { resetDatabase } from "./helpers/reset-database";

const owner = {
  organizationName: "Sapax Shop",
  fullName: "Roobi Test",
  email: "owner@sapax.test",
  password: "long-enough-password",
};

function jsonRequest(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function cookieRequest(path: string, method: "GET" | "POST", cookie?: string): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: cookie ? { cookie } : {},
  });
}

function sessionCookieFrom(response: Response): string {
  const header = response.headers.get("set-cookie") ?? "";
  const match = header.match(/xalora_session=([^;]+)/);

  if (!match) {
    throw new Error("No session cookie was set");
  }

  return `xalora_session=${match[1]}`;
}

async function registerOwner(): Promise<void> {
  await register(jsonRequest("/api/v1/auth/register", owner));
}

describe("auth sessions (real database)", () => {
  beforeEach(async () => {
    await resetDatabase();
    await registerOwner();
  });

  it("logs in with correct credentials and sets a secure session cookie", async () => {
    const response = await login(
      jsonRequest("/api/v1/auth/login", { email: owner.email, password: owner.password }),
    );
    const setCookie = (response.headers.get("set-cookie") ?? "").toLowerCase();

    expect(response.status).toBe(200);
    expect((await response.json()).user.email).toBe(owner.email);
    expect(setCookie).toContain("httponly");
    expect(setCookie).toContain("samesite=lax");
    expect(setCookie).toContain("path=/");
  });

  it("stores only a hash of the session token", async () => {
    const response = await login(
      jsonRequest("/api/v1/auth/login", { email: owner.email, password: owner.password }),
    );
    const rawToken = sessionCookieFrom(response).split("=")[1];

    const [stored] = await db.select().from(sessions);

    expect(stored.tokenHash).not.toBe(rawToken);
    expect(stored.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns 401 with the same message for a wrong password", async () => {
    const response = await login(
      jsonRequest("/api/v1/auth/login", { email: owner.email, password: "wrong-password" }),
    );

    expect(response.status).toBe(401);
    expect((await response.json()).error.message).toBe("Invalid email or password.");
  });

  it("returns 401 with the same message for an unknown email", async () => {
    const response = await login(
      jsonRequest("/api/v1/auth/login", { email: "nobody@sapax.test", password: owner.password }),
    );

    expect(response.status).toBe(401);
    expect((await response.json()).error.message).toBe("Invalid email or password.");
  });

  it("returns the current user for a valid session cookie", async () => {
    const loginResponse = await login(
      jsonRequest("/api/v1/auth/login", { email: owner.email, password: owner.password }),
    );

    const response = await me(cookieRequest("/api/v1/auth/me", "GET", sessionCookieFrom(loginResponse)));

    expect(response.status).toBe(200);
    expect((await response.json()).user.email).toBe(owner.email);
  });

  it("returns 401 from /me without a cookie", async () => {
    const response = await me(cookieRequest("/api/v1/auth/me", "GET"));

    expect(response.status).toBe(401);
  });

  it("invalidates the session on logout", async () => {
    const loginResponse = await login(
      jsonRequest("/api/v1/auth/login", { email: owner.email, password: owner.password }),
    );
    const cookie = sessionCookieFrom(loginResponse);

    const logoutResponse = await logout(cookieRequest("/api/v1/auth/logout", "POST", cookie));
    const meResponse = await me(cookieRequest("/api/v1/auth/me", "GET", cookie));

    expect(logoutResponse.status).toBe(204);
    expect(meResponse.status).toBe(401);
  });

  it("rejects an expired session", async () => {
    const loginResponse = await login(
      jsonRequest("/api/v1/auth/login", { email: owner.email, password: owner.password }),
    );
    const cookie = sessionCookieFrom(loginResponse);

    // Only one session exists in this test, so an unconditional update is safe here.
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 60_000) });

    const response = await me(cookieRequest("/api/v1/auth/me", "GET", cookie));

    expect(response.status).toBe(401);
  });
});