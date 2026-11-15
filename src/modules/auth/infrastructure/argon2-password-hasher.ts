import { hash, verify } from "@node-rs/argon2";
import type { PasswordHasher } from "../domain/password-hasher";

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword);
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    try {
      return await verify(passwordHash, plainPassword);
    } catch {
      // A malformed stored hash is treated as a failed match, not a crash.
      return false;
    }
  }
}