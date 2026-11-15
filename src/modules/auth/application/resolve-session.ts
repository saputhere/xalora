import { hashSessionToken } from "../../../shared/security/session-token";
import type { SessionRepository, SessionUser } from "../domain/session";

export class ResolveSessionUseCase {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute(token: string | undefined): Promise<SessionUser | null> {
    if (!token) {
      return null;
    }

    return this.sessions.findActiveUser(hashSessionToken(token), this.clock());
  }
}