"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { MyReviews } from "@/features/reviews/components/my-reviews";

function DashboardEntry() {
  return (
    <main className="min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-soft md:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          Customer dashboard
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Your shopping space.</h1>
        <p className="mt-3 leading-7 text-muted">
          Review the feedback you have shared, update your profile, and keep track of your
          shopping activity.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-block text-sm font-semibold text-brand"
        >
          View account →
        </Link>
        <MyReviews />
      </div>
    </main>
  );
}
export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <DashboardEntry />
    </ProtectedRoute>
  );
}
