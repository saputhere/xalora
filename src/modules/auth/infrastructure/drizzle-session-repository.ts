import { and, eq, gt } from "drizzle-orm";
import type { Database } from "../../../shared/db/client";
import { sessions, users } from "../../../shared/db/schema";
import type {
  CreateSessionData,
  SessionRepository,
  SessionUser,
} from "../domain/session";

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly database: Database) {}

  async create(data: CreateSessionData): Promise<void> {
    await this.database.insert(sessions).values({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
  }

  async findActiveUser(tokenHash: string, now: Date): Promise<SessionUser | null> {
    const [row] = await this.database
      .select({
        userId: users.id,
        organizationId: users.organizationId,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    return row ?? null;
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.database.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
}