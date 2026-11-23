"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useAuthStore } from "@/features/auth/store/auth-store";

function AdminContent() {
  const getCurrentUser = useAuthStore((state)=>state.getCurrentUser);
  const user = getCurrentUser();
  return <main className="min-h-screen px-5 py-12"><div className="mx-auto max-w-5xl"><Link href="/" className="text-sm text-brand hover:underline">← Back to storefront</Link><section className="mt-8 rounded-[2rem] bg-white p-8 shadow-soft md:p-12"><div className="flex items-center gap-3 text-brand"><ShieldCheck size={28}/><span className="text-xs font-bold uppercase tracking-widest">Administrator area</span></div><h1 className="mt-5 text-3xl font-semibold">Welcome, {user?.name}</h1><p className="mt-3 max-w-2xl leading-7 text-muted">Your administrator role has been verified by the local authentication layer. Catalogue, orders, and recommendation analytics will be added in the Admin Dashboard phase.</p><p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Development-only role gate. This frontend check is not a security boundary for a production system.</p></section></div></main>;
}
export default function AdminPage(){return <ProtectedRoute requiredRole="ADMIN"><AdminContent/></ProtectedRoute>;}
