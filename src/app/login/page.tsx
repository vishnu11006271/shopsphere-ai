"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/account");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!hasHydrated)
    return <main className="grid min-h-screen place-items-center">Loading sign-in…</main>;
  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <div className="mx-auto mt-10 grid max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-soft md:grid-cols-2">
          <section className="bg-[#e8eee7] p-8 md:p-12">
            <div className="flex items-center gap-2 font-black">
              shop<span className="text-brand">sphere</span>
              <span className="text-xs text-brand">AI</span>
            </div>
            <div className="mt-16">
              <ShoppingBag size={34} className="text-brand" />
              <h1 className="mt-5 text-4xl font-semibold tracking-tight">
                Welcome back.
              </h1>
              <p className="mt-4 leading-7 text-muted">
                Sign in to pick up where you left off and keep your shopping experience
                personal.
              </p>
            </div>
            <div className="mt-12 rounded-2xl bg-white/80 p-5 text-sm">
              <p className="font-semibold">Demo accounts</p>
              <p className="mt-3 text-muted">Customer: customer@shopsphere.demo</p>
              <p className="text-muted">Admin: admin@shopsphere.demo</p>
              <p className="mt-2 text-xs text-muted">
                Password for both: Customer@123 / Admin@123 respectively.
              </p>
            </div>
          </section>
          <section className="p-8 md:p-12">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
              <LockKeyhole size={14} /> Secure demo sign in
            </div>
            <h2 className="mt-5 text-2xl font-semibold">Sign in to your account</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  required
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted">
              New to ShopSphere?{" "}
              <Link href="/register" className="font-semibold text-brand hover:underline">
                Create an account
              </Link>
            </p>
            <p className="mt-8 text-xs leading-5 text-muted">
              Development authentication only. Do not reuse a real password or enter
              sensitive information. If you were redirected here during checkout, your
              progress is saved locally and will resume after sign-in.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
