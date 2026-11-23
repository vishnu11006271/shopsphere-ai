"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import type { UserRole } from "../types";

export function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: UserRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const session = useAuthStore((state) => state.session);
  const users = useAuthStore((state) => state.users);
  const user = useMemo(() => {
    if (!session || session.expiresAt <= Date.now()) return null;
    return users.find((item) => item.id === session.userId) ?? null;
  }, [session, users]);

  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!userId) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requiredRole && userRole !== requiredRole) router.replace("/account");
  }, [hasHydrated, pathname, requiredRole, router, userId, userRole]);

  if (!hasHydrated || !user || (requiredRole && user.role !== requiredRole)) {
    return <main className="grid min-h-screen place-items-center px-5"><p className="text-sm text-muted" role="status">Checking your session…</p></main>;
  }
  return <>{children}</>;
}
