import { Argon2PasswordHasher } from "../modules/auth/infrastructure/argon2-password-hasher";
import { DrizzleAuthRepository } from "../modules/auth/infrastructure/drizzle-auth-repository";
import { RegisterOrganizationUseCase } from "../modules/auth/application/register-organization";
import { db } from "./db/client";

// Composition root: the only place that knows which concrete classes are used.
export const registerOrganizationUseCase = new RegisterOrganizationUseCase(
  new DrizzleAuthRepository(db),
  new Argon2PasswordHasher(),
);