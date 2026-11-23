"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (name.trim().length < 2) return setError("Enter your name (at least 2 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return setError("Use at least 8 characters, including a letter and a number.");
    if (password !== confirm) return setError("Your passwords do not match.");
    setBusy(true);
    try { await register(name,email,password); router.replace("/account"); }
    catch(err) { setError(err instanceof Error ? err.message : "Unable to create your account."); }
    finally { setBusy(false); }
  }
  if (!hasHydrated) return <main className="grid min-h-screen place-items-center">Loading registration…</main>;
  return <main className="min-h-screen px-5 py-10"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16}/> Back to shop</Link>
    <section className="mx-auto mt-10 max-w-xl rounded-[2rem] bg-white p-8 shadow-soft md:p-12"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8eee7] text-brand"><UserPlus size={22}/></div><h1 className="mt-6 text-3xl font-semibold tracking-tight">Create your account</h1><p className="mt-2 text-sm text-muted">Your new account starts with the Customer role.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div><label htmlFor="name" className="mb-2 block text-sm font-medium">Full name</label><input id="name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-brand" required/></div>
        <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-brand" required/></div>
        <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><input id="password" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-brand" required/><p className="mt-1 text-xs text-muted">At least 8 characters, with a letter and a number.</p></div>
        <div><label htmlFor="confirm" className="mb-2 block text-sm font-medium">Confirm password</label><input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-brand" required/></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
      </form><p className="mt-6 text-sm text-muted">Already registered? <Link href="/login" className="font-semibold text-brand">Sign in</Link></p>
      <p className="mt-8 text-xs leading-5 text-muted">This is a local demo account stored in this browser. Do not enter real or reused credentials.</p>
    </section></div></main>;
}
