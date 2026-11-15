export type OrganizationRole = "owner" | "admin" | "member";

export interface RegisterOrganizationData {
  organizationName: string;
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface RegisteredAccount {
  organizationId: string;
  organizationName: string;
  userId: string;
  email: string;
  fullName: string;
  role: OrganizationRole;
}

export interface AuthRepository {
  createOrganizationWithOwner(data: RegisterOrganizationData): Promise<RegisteredAccount>;
}