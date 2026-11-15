import { beforeEach, describe, expect, it } from "vitest";
import { RegisterOrganizationUseCase } from "../../src/modules/auth/application/register-organization";
import { EmailAlreadyRegisteredError } from "../../src/modules/auth/domain/errors";
import { ValidationError } from "../../src/shared/errors/app-errors";
import { FakePasswordHasher } from "./fakes/fake-password-hasher";
import { InMemoryAuthRepository } from "./fakes/in-memory-auth-repository";

const validInput = {
  organizationName: "Sapax Shop",
  fullName: "Roobi Test",
  email: "owner@sapax.test",
  password: "long-enough-password",
};

describe("RegisterOrganizationUseCase", () => {
  let repository: InMemoryAuthRepository;
  let hasher: FakePasswordHasher;
  let useCase: RegisterOrganizationUseCase;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    hasher = new FakePasswordHasher();
    useCase = new RegisterOrganizationUseCase(repository, hasher);
  });

  describe("successful registration", () => {
    it("creates an organization and an owner account", async () => {
      const account = await useCase.execute(validInput);

      expect(account).toMatchObject({
        organizationName: "Sapax Shop",
        email: "owner@sapax.test",
        fullName: "Roobi Test",
        role: "owner",
      });
      expect(repository.accountCount).toBe(1);
    });

    it("stores the password hash, never the plain password", async () => {
      await useCase.execute(validInput);

      expect(repository.storedPasswordHashFor("owner@sapax.test")).toBe(
        "fake-hash:long-enough-password",
      );
    });

    it("normalizes email case and surrounding whitespace", async () => {
      const account = await useCase.execute({
        ...validInput,
        email: "  Owner@SAPAX.test ",
      });

      expect(account.email).toBe("owner@sapax.test");
    });

    it("trims the organization and full name", async () => {
      const account = await useCase.execute({
        ...validInput,
        organizationName: "  Sapax Shop  ",
        fullName: "  Roobi Test  ",
      });

      expect(account.organizationName).toBe("Sapax Shop");
      expect(account.fullName).toBe("Roobi Test");
    });
  });

  describe("validation failures", () => {
    it("rejects an invalid email and does not hash the password", async () => {
      await expect(useCase.execute({ ...validInput, email: "not-an-email" })).rejects.toMatchObject({
        fieldErrors: { email: expect.any(Array) },
      });

      expect(hasher.hashCallCount).toBe(0);
      expect(repository.accountCount).toBe(0);
    });

    it("rejects a password shorter than 8 characters", async () => {
      await expect(useCase.execute({ ...validInput, password: "short" })).rejects.toBeInstanceOf(
        ValidationError,
      );
    });

    it("rejects a password longer than 128 characters", async () => {
      await expect(
        useCase.execute({ ...validInput, password: "a".repeat(129) }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("accepts a password of exactly 128 characters", async () => {
      const account = await useCase.execute({ ...validInput, password: "a".repeat(128) });

      expect(account.role).toBe("owner");
    });

    it("rejects an empty organization name", async () => {
      await expect(
        useCase.execute({ ...validInput, organizationName: "   " }),
      ).rejects.toMatchObject({ fieldErrors: { organizationName: expect.any(Array) } });
    });
  });

  describe("duplicate accounts", () => {
    it("rejects an email that is already registered", async () => {
      await useCase.execute(validInput);

      await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(
        EmailAlreadyRegisteredError,
      );
    });

    it("treats emails differing only by case as duplicates", async () => {
      await useCase.execute(validInput);

      await expect(
        useCase.execute({ ...validInput, email: "OWNER@sapax.test" }),
      ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
    });
  });

  describe("failure handling", () => {
    it("stores nothing when the repository fails", async () => {
      repository.failNextCreateWith = new Error("database unavailable");

      await expect(useCase.execute(validInput)).rejects.toThrow("database unavailable");
      expect(repository.accountCount).toBe(0);
    });
  });
});