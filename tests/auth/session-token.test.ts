import { describe, expect, it } from "vitest";
import {
  generateSessionToken,
  hashSessionToken,
} from "../../src/shared/security/session-token";

describe("session tokens", () => {
  it("generates a 256-bit URL-safe token", () => {
    const token = generateSessionToken();

    // 32 bytes encoded as base64url without padding is 43 characters.
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("generates a different token every time", () => {
    expect(generateSessionToken()).not.toBe(generateSessionToken());
  });

  it("hashes a token to a 64-character hex digest", () => {
    const token = generateSessionToken();
    const hash = hashSessionToken(token);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(token);
  });

  it("produces the same hash for the same token", () => {
    expect(hashSessionToken("abc")).toBe(hashSessionToken("abc"));
  });
});