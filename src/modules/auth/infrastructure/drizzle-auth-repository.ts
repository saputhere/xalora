import type { Database } from "../../../shared/db/client";
import { organizations, users } from "../../../shared/db/schema";
import type {
  AuthRepository,
  RegisteredAccount,
  RegisterOrganizationData,
} from "../domain/auth-repository";
import { EmailAlreadyRegisteredError } from "../domain/errors";

const UNIQUE_VIOLATION_CODE = "23505";
const USERS_EMAIL_CONSTRAINT = "users_email_unique";

export class DrizzleAuthRepository implements AuthRepository {
  constructor(private readonly database: Database) {}

  async createOrganizationWithOwner(data: RegisterOrganizationData): Promise<RegisteredAccount> {
    try {
      return await this.database.transaction(async (tx) => {
        const [organization] = await tx
          .insert(organizations)
          .values({ name: data.organizationName })
          .returning({ id: organizations.id, name: organizations.name });

        const [user] = await tx
          .insert(users)
          .values({
            organizationId: organization.id,
            email: data.email,
            passwordHash: data.passwordHash,
            fullName: data.fullName,
            role: "owner",
          })
          .returning({ id: users.id, email: users.email, fullName: users.fullName });

        return {
          organizationId: organization.id,
          organizationName: organization.name,
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          role: "owner",
        };
      });
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
  }
}

function isEmailUniqueViolation(error: unknown): boolean {
  const cause = error instanceof Error && "cause" in error ? error.cause : error;

  if (typeof cause !== "object" || cause === null) {
    return false;
  }

  return (
    "code" in cause &&
    cause.code === UNIQUE_VIOLATION_CODE &&
    "constraint" in cause &&
    cause.constraint === USERS_EMAIL_CONSTRAINT
  );
}