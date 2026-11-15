import { ValidationError } from "../../../shared/errors/app-errors";
import type { PasswordHasher } from "../domain/password-hasher";
import type { AuthRepository, RegisteredAccount } from "../domain/auth-repository";
import { registerSchema, type RegisterInput } from "./register-schema";

export class RegisterOrganizationUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<RegisteredAccount> {
    const parsed = registerSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.flatten().fieldErrors);
    }

    const { organizationName, fullName, email, password } = parsed.data;
    const passwordHash = await this.passwordHasher.hash(password);

    return this.authRepository.createOrganizationWithOwner({
      organizationName,
      fullName,
      email,
      passwordHash,
    });
  }
}