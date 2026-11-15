import { ValidationError } from "../../../shared/errors/app-errors";
import {
  generateSessionToken,
  hashSessionToken,
} from "../../../shared/security/session-token";
import { InvalidCredentialsError } from "../domain/errors";
import type { PasswordHasher } from "../domain/password-hasher";
import {
  SESSION_TTL_MS,
  type SessionRepository,
  type SessionUser,
} from "../domain/session";
import type { UserCredentials, UserRepository } from "../domain/user-repository";
import { loginSchema } from "./login-schema";

export interface LoginResult {
  token: string;
  expiresAt: Date;
  user: SessionUser;
}

export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute(input: unknown): Promise<LoginResult> {
    const parsed = loginSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const credentials = await this.users.findCredentialsByEmail(email);

    if (!credentials) {
      // Hash anyway so an unknown email takes about as long as a wrong password.
      await this.passwordHasher.hash(password);
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.verify(
      password,
      credentials.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return this.startSession(credentials);
  }

  private async startSession(credentials: UserCredentials): Promise<LoginResult> {
    const token = generateSessionToken();
    const expiresAt = new Date(this.clock().getTime() + SESSION_TTL_MS);

    await this.sessions.create({
      userId: credentials.userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    });

    return { token, expiresAt, user: toSessionUser(credentials) };
  }
}

function toSessionUser(credentials: UserCredentials): SessionUser {
  return {
    userId: credentials.userId,
    organizationId: credentials.organizationId,
    email: credentials.email,
    fullName: credentials.fullName,
    role: credentials.role,
  };
}