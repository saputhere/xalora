import type { SessionUser } from "./session";

export interface UserCredentials extends SessionUser {
  passwordHash: string;
}

export interface UserRepository {
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
}