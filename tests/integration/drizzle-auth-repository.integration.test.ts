import { count } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../../src/shared/db/client";
import { organizations, users } from "../../src/shared/db/schema";
import { DrizzleAuthRepository } from "../../src/modules/auth/infrastructure/drizzle-auth-repository";
import { EmailAlreadyRegisteredError } from "../../src/modules/auth/domain/errors";
import { resetDatabase } from "./helpers/reset-database";

const registration = {
  organizationName: "Sapax Shop",
  fullName: "Roobi Test",
  email: "owner@sapax.test",
  passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$placeholder$placeholder",
};

describe("DrizzleAuthRepository (real database)", () => {
  const repository = new DrizzleAuthRepository(db);

  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates an organization and an owner in the database", async () => {
    const account = await repository.createOrganizationWithOwner(registration);

    expect(account).toMatchObject({
      organizationName: "Sapax Shop",
      email: "owner@sapax.test",
      role: "owner",
    });

    const [storedUser] = await db.select().from(users);
    expect(storedUser.organizationId).toBe(account.organizationId);
    expect(storedUser.passwordHash).toBe(registration.passwordHash);
  });

  it("rejects a duplicate email with EmailAlreadyRegisteredError", async () => {
    await repository.createOrganizationWithOwner(registration);

    await expect(repository.createOrganizationWithOwner(registration)).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it("rolls back the organization when the user insert fails", async () => {
    // A null password hash violates the NOT NULL constraint after the
    // organization row has already been inserted in the same transaction.
    const invalidRegistration = {
      ...registration,
      passwordHash: null as unknown as string,
    };

    await expect(repository.createOrganizationWithOwner(invalidRegistration)).rejects.toThrow();

    const [{ total }] = await db.select({ total: count() }).from(organizations);
    expect(total).toBe(0);
  });
});