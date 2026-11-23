"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Scale, ShoppingBag, Star } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/product";
export function DiscoveryProductCard({product,onQuickView,onCompare,comparing}:{product:Product;onQuickView:(p:Product)=>void;onCompare:(p:Product)=>void;comparing:boolean}) {
 const addItem=useCartStore(s=>s.addItem);const isSaved=useWishlistStore(s=>s.productIds.includes(product.id));const toggleWishlist=useWishlistStore(s=>s.toggle);
 return <article className="group overflow-hidden rounded-3xl bg-white p-3 shadow-soft"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f0f1eb]">
  <Image src={product.thumbnail} alt={product.title} fill sizes="(max-width:640px) 45vw,(max-width:1200px) 25vw,240px" className="object-contain p-5 transition duration-500 group-hover:scale-105"/>
  {product.discountPercentage>0&&<span className="absolute left-3 top-3 rounded-full bg-[#f4e7d1] px-3 py-1 text-xs font-semibold text-[#8b5a13]">-{Math.round(product.discountPercentage)}%</span>}
  <button type="button" aria-label={isSaved?`Remove ${product.title} from wishlist`:`Add ${product.title} to wishlist`} onClick={()=>toggleWishlist(product.id,product)} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-ink shadow-sm hover:text-rose-600"><Heart size={17} className={isSaved?"fill-rose-500 text-rose-500":""}/></button>
  <button type="button" onClick={()=>onQuickView(product)} className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-full bg-white/95 py-2.5 text-xs font-semibold shadow-sm sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"><Eye size={14}/> Quick view</button>
 </div><div className="px-2 pb-2 pt-4"><p className="text-xs capitalize tracking-wide text-muted">{product.category}{product.brand?` · ${product.brand}`:""}</p><h3 className="mt-1 min-h-10 line-clamp-2 text-sm font-semibold text-ink"><Link href={`/products/${product.id}`} className="hover:text-brand">{product.title}</Link></h3>
  <div className="mt-2 flex items-center gap-1 text-xs text-muted"><Star size={13} className="fill-accent text-accent"/>{product.rating.toFixed(1)} <span>·</span>{product.stock>0?"In stock":"Out of stock"}</div>
  <div className="mt-4 flex items-center justify-between gap-2"><span className="font-bold">{formatINR(product.price*85)}</span><div className="flex items-center gap-1"><button type="button" aria-label={comparing?`Remove ${product.title} from comparison`:`Compare ${product.title}`} onClick={()=>onCompare(product)} className={`rounded-full p-2 ${comparing?"bg-brand text-white":"bg-canvas text-muted hover:text-brand"}`}><Scale size={15}/></button><button type="button" aria-label={`Add ${product.title} to cart`} disabled={product.stock<1} className="rounded-full bg-brand p-2.5 text-white disabled:opacity-40" onClick={()=>addItem(product)}><ShoppingBag size={16}/></button></div></div>
 </div></article>;
}
