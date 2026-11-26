"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthSession, AuthUser, PublicUser, UserRole } from "../types";
import { toPublicUser } from "../types";
import { demoPasswordSalt, hashPassword, verifyPassword } from "../services/password";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const demoUsers: AuthUser[] = [
  {
    id: "demo-customer",
    name: "Demo Customer",
    email: "customer@shopsphere.demo",
    role: "CUSTOMER",
    passwordSalt: demoPasswordSalt,
    passwordHash: "c0285161c8a27fb1a60013d7d95da19f2a7e9abf8fb0e445b3fbaa2386a35f84",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-admin",
    name: "Demo Administrator",
    email: "admin@shopsphere.demo",
    role: "ADMIN",
    passwordSalt: demoPasswordSalt,
    passwordHash: "7518c4d96dc5d498078a4c9032ed62ae9527fabc74b22b6c2bddf613d776827f",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

interface AuthState {
  users: AuthUser[];
  session: AuthSession | null;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (name: string, email: string, password: string) => Promise<PublicUser>;
  logout: () => void;
  getCurrentUser: () => PublicUser | null;
  isSessionValid: () => boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: demoUsers,
      session: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      isSessionValid: () => {
        const session = get().session;
        if (!session || session.expiresAt <= Date.now()) {
          return false;
        }
        return true;
      },
      getCurrentUser: () => {
        if (!get().isSessionValid()) return null;
        const session = get().session;
        const user = get().users.find((item) => item.id === session?.userId);
        return user ? toPublicUser(user) : null;
      },
      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const user = get().users.find((item) => item.email === normalizedEmail);
        if (
          !user ||
          !(await verifyPassword(
            user.email,
            password,
            user.passwordSalt,
            user.passwordHash,
          ))
        ) {
          throw new Error("The email or password you entered is incorrect.");
        }
        set({
          session: {
            token: crypto.randomUUID(),
            userId: user.id,
            expiresAt: Date.now() + SESSION_TTL_MS,
          },
        });
        return toPublicUser(user);
      },
      register: async (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (get().users.some((item) => item.email === normalizedEmail)) {
          throw new Error("An account with this email already exists. Please sign in.");
        }
        const salt = crypto.randomUUID();
        const user: AuthUser = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: normalizedEmail,
          role: "CUSTOMER" as UserRole,
          passwordSalt: salt,
          passwordHash: await hashPassword(password, salt),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          users: [...state.users, user],
          session: {
            token: crypto.randomUUID(),
            userId: user.id,
            expiresAt: Date.now() + SESSION_TTL_MS,
          },
        }));
        return toPublicUser(user);
      },
      logout: () => set({ session: null }),
    }),
    {
      name: "shopsphere-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ users: state.users, session: state.session }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
