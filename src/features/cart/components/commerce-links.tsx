import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

export function CommerceLinks({ cartCount = 0, wishlistCount = 0 }: { cartCount?: number; wishlistCount?: number }) {
  return <nav aria-label="Shopping navigation" className="flex items-center gap-2">
    <Link href="/wishlist" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm hover:text-brand"><Heart size={15}/> Wishlist <span className="rounded-full bg-canvas px-2 py-0.5 tabular-nums">{wishlistCount}</span></Link>
    <Link href="/cart" className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1b5842]"><ShoppingBag size={15}/> Cart <span className="rounded-full bg-white/20 px-2 py-0.5 tabular-nums">{cartCount}</span></Link>
  </nav>;
}
