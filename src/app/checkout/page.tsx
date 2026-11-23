"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/features/auth/components/protected-route";

function CheckoutEntry() {
  return <main className="min-h-screen px-5 py-12"><div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-soft md:p-12"><p className="text-xs font-bold uppercase tracking-widest text-brand">Checkout access</p><h1 className="mt-4 text-3xl font-semibold">You’re signed in and ready to continue.</h1><p className="mt-3 leading-7 text-muted">The multi-step simulated checkout is scheduled for Phase 06. No payment information is collected in this phase.</p><Link href="/account" className="mt-6 inline-block text-sm font-semibold text-brand">Go to your account →</Link></div></main>;
}
export default function CheckoutPage(){return <ProtectedRoute requiredRole="CUSTOMER"><CheckoutEntry/></ProtectedRoute>;}
