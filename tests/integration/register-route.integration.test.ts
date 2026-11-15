import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "../../src/app/api/v1/auth/register/route";
import { db } from "../../src/shared/db/client";
import { users } from "../../src/shared/db/schema";
import { resetDatabase } from "./helpers/reset-database";

const validBody = {
  organizationName: "Sapax Shop",
  fullName: "Roobi Test",
  email: "owner@sapax.test",
  password: "long-enough-password",
};

function registerRequest(body: unknown): Request {
  return new Request("http://localhost/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/v1/auth/register (real database)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns 201 with the account and no password data", async () => {
    const response = await POST(registerRequest(validBody));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toMatchObject({ email: "owner@sapax.test", role: "owner" });
    expect(JSON.stringify(payload)).not.toContain("password");
  });

  it("stores an Argon2id hash, never the plain password", async () => {
    await POST(registerRequest(validBody));

    const [storedUser] = await db.select().from(users);
    expect(storedUser.passwordHash).toMatch(/^\$argon2id\$/);
    expect(storedUser.passwordHash).not.toContain(validBody.password);
  });

  it("returns 400 with field errors for an invalid email", async () => {
    const response = await POST(registerRequest({ ...validBody, email: "not-an-email" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("VALIDATION_FAILED");
    expect(payload.error.details.email).toBeDefined();
  });

  it("returns 400 for a malformed JSON body", async () => {
    const response = await POST(registerRequest("{not json"));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("INVALID_JSON");
  });

  it("returns 409 for a duplicate email", async () => {
    await POST(registerRequest(validBody));
    const response = await POST(registerRequest(validBody));

    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("stores exactly one user after a duplicate attempt", async () => {
    await POST(registerRequest(validBody));
    await POST(registerRequest(validBody));

    const storedUsers = await db.select().from(users);
    expect(storedUsers).toHaveLength(1);
  });
});