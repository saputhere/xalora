import { eq } from "drizzle-orm";
import type { Database } from "../../../shared/db/client";
import { users } from "../../../shared/db/schema";
import type { UserCredentials, UserRepository } from "../domain/user-repository";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly database: Database) {}

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const [row] = await this.database
      .select({
        userId: users.id,
        organizationId: users.organizationId,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return row ?? null;
  }
}