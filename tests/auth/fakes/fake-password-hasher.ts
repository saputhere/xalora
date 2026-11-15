import type { PasswordHasher } from "../../../src/modules/auth/domain/password-hasher";

export class FakePasswordHasher implements PasswordHasher {
  hashCallCount = 0;

  async hash(plainPassword: string): Promise<string> {
    this.hashCallCount += 1;
    return `fake-hash:${plainPassword}`;
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    return passwordHash === `fake-hash:${plainPassword}`;
  }
}