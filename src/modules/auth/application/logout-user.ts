import { hashSessionToken } from "../../../shared/security/session-token";
import type { SessionRepository } from "../domain/session";

export class LogoutUserUseCase {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }

    await this.sessions.deleteByTokenHash(hashSessionToken(token));
  }
}