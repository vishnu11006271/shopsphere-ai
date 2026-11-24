"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { RecommendationPreferencesPanel } from "@/features/recommendations/components/recommendation-preferences-panel";

function AccountContent() {
  const router = useRouter();
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
  const user = getCurrentUser();
  const logout = useAuthStore((state) => state.logout);
  return <main className="min-h-screen px-5 py-12"><div className="mx-auto max-w-4xl"><Link href="/" className="text-sm text-brand hover:underline">← Back to storefront</Link>
    <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-soft md:p-12"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">Your account</p><h1 className="mt-3 text-3xl font-semibold">Hello, {user?.name}</h1><p className="mt-2 text-muted">{user?.email}</p></div><Button variant="secondary" onClick={()=>{logout();router.replace("/");}}><LogOut size={16} className="mr-2"/> Sign out</Button></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#f6f7f2] p-6"><ShoppingBag className="text-brand"/><h2 className="mt-4 font-semibold">Orders</h2><p className="mt-1 text-sm text-muted">View your purchases and follow each simulated delivery milestone.</p><Link href="/orders" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand">View order history <ArrowRight size={14}/></Link></div><div className="rounded-2xl bg-[#f6f7f2] p-6"><ShieldCheck className="text-brand"/><h2 className="mt-4 font-semibold">Account role</h2><p className="mt-1 text-sm text-muted">{user?.role === "ADMIN" ? "Administrator" : "Customer"} access</p>{user?.role === "ADMIN" && <Link href="/admin" className="mt-3 inline-block text-sm font-semibold text-brand">Open admin dashboard →</Link>}</div></div>
    </section></div></main>;
}
export default function AccountPage(){return <ProtectedRoute><AccountContent/></ProtectedRoute>;}
