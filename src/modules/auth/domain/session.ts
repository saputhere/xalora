import type { OrganizationRole } from "./auth-repository";

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  userId: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: OrganizationRole;
}

export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create(data: CreateSessionData): Promise<void>;
  findActiveUser(tokenHash: string, now: Date): Promise<SessionUser | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}