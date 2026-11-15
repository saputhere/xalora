import type {
  AuthRepository,
  RegisteredAccount,
  RegisterOrganizationData,
} from "../../../src/modules/auth/domain/auth-repository";
import { EmailAlreadyRegisteredError } from "../../../src/modules/auth/domain/errors";

interface StoredAccount extends RegisteredAccount {
  passwordHash: string;
}

export class InMemoryAuthRepository implements AuthRepository {
  private readonly accountsByEmail = new Map<string, StoredAccount>();
  private nextId = 1;

  failNextCreateWith: Error | null = null;

  get accountCount(): number {
    return this.accountsByEmail.size;
  }

  storedPasswordHashFor(email: string): string | undefined {
    return this.accountsByEmail.get(email)?.passwordHash;
  }

  async createOrganizationWithOwner(data: RegisterOrganizationData): Promise<RegisteredAccount> {
    if (this.failNextCreateWith) {
      const error = this.failNextCreateWith;
      this.failNextCreateWith = null;
      throw error;
    }

    if (this.accountsByEmail.has(data.email)) {
      throw new EmailAlreadyRegisteredError();
    }

    const account: StoredAccount = {
      organizationId: `org-${this.nextId}`,
      organizationName: data.organizationName,
      userId: `user-${this.nextId}`,
      email: data.email,
      fullName: data.fullName,
      role: "owner",
      passwordHash: data.passwordHash,
    };

    this.nextId += 1;
    this.accountsByEmail.set(data.email, account);

    const { passwordHash: _passwordHash, ...registeredAccount } = account;
    return registeredAccount;
  }
}