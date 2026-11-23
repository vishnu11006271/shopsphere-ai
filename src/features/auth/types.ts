export type UserRole = "CUSTOMER" | "ADMIN";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}
export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: number;
}
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export function toPublicUser(user: AuthUser): PublicUser {
  const { id, name, email, role } = user;
  return { id, name, email, role };
}
