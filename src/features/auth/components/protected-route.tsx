"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";
import type { UserRole } from "../types";

export function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: UserRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
  const isSessionValid = useAuthStore((state) => state.isSessionValid);
  const user = getCurrentUser();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isSessionValid() || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requiredRole && user.role !== requiredRole) router.replace("/account");
  }, [hasHydrated, isSessionValid, pathname, requiredRole, router, user?.id, user?.role]);

  if (!hasHydrated || !user || (requiredRole && user.role !== requiredRole)) {
    return <main className="grid min-h-screen place-items-center px-5"><p className="text-sm text-muted" role="status">Checking your session…</p></main>;
  }
  return <>{children}</>;
}
