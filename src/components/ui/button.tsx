import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };
export function Button({ className, variant = "primary", ...props }: Props) {
  const styles = { primary: "bg-brand text-white hover:bg-[#1b5842]", secondary: "bg-white text-ink ring-1 ring-black/10 hover:bg-stone-50", ghost: "bg-transparent text-ink hover:bg-black/5" };
  return <button className={cn("inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50", styles[variant], className)} {...props} />;
}
