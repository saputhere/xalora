import { describe, expect, it } from "vitest";
import { Argon2PasswordHasher } from "../../src/modules/auth/infrastructure/argon2-password-hasher";

describe("Argon2PasswordHasher", () => {
  const hasher = new Argon2PasswordHasher();
  const password = "correct-horse-battery-staple";

  it("returns an Argon2id hash that does not contain the plain password", async () => {
    const passwordHash = await hasher.hash(password);

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    expect(passwordHash).not.toContain(password);
  });

  it("verifies the correct password", async () => {
    const passwordHash = await hasher.hash(password);

    expect(await hasher.verify(password, passwordHash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const passwordHash = await hasher.hash(password);

    expect(await hasher.verify("wrong-password", passwordHash)).toBe(false);
  });

  it("is case sensitive", async () => {
    const passwordHash = await hasher.hash(password);

    expect(await hasher.verify(password.toUpperCase(), passwordHash)).toBe(false);
  });

  it("produces different hashes for the same password because of unique salts", async () => {
    const firstHash = await hasher.hash(password);
    const secondHash = await hasher.hash(password);

    expect(firstHash).not.toBe(secondHash);
  });

  it("returns false instead of throwing for a malformed stored hash", async () => {
    expect(await hasher.verify(password, "not-a-real-hash")).toBe(false);
  });

  it("handles non-ASCII passwords", async () => {
    const unicodePassword = "pássw0rd-ශ්‍රී-🔐";
    const passwordHash = await hasher.hash(unicodePassword);

    expect(await hasher.verify(unicodePassword, passwordHash)).toBe(true);
  });
});