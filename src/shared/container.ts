import { db } from "./db/client";
import { Argon2PasswordHasher } from "../modules/auth/infrastructure/argon2-password-hasher";
import { DrizzleAuthRepository } from "../modules/auth/infrastructure/drizzle-auth-repository";
import { DrizzleSessionRepository } from "../modules/auth/infrastructure/drizzle-session-repository";
import { DrizzleUserRepository } from "../modules/auth/infrastructure/drizzle-user-repository";
import { RegisterOrganizationUseCase } from "../modules/auth/application/register-organization";
import { LoginUserUseCase } from "../modules/auth/application/login-user";
import { LogoutUserUseCase } from "../modules/auth/application/logout-user";
import { ResolveSessionUseCase } from "../modules/auth/application/resolve-session";

// Composition root: the only place that knows which concrete classes are used.
const passwordHasher = new Argon2PasswordHasher();
const userRepository = new DrizzleUserRepository(db);
const sessionRepository = new DrizzleSessionRepository(db);

export const registerOrganizationUseCase = new RegisterOrganizationUseCase(
  new DrizzleAuthRepository(db),
  passwordHasher,
);

export const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  sessionRepository,
  passwordHasher,
);

export const logoutUserUseCase = new LogoutUserUseCase(sessionRepository);

export const resolveSessionUseCase = new ResolveSessionUseCase(sessionRepository);