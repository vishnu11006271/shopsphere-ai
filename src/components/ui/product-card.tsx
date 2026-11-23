"use client";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return <article className="group overflow-hidden rounded-3xl bg-white p-3 shadow-soft">
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f0f1eb]">
      <Image src={product.thumbnail} alt={product.title} fill sizes="(max-width: 640px) 45vw, (max-width: 1200px) 25vw, 240px" className="object-contain p-5 transition duration-500 group-hover:scale-105" />
      {product.discountPercentage > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#f4e7d1] px-3 py-1 text-xs font-semibold text-[#8b5a13]">-{Math.round(product.discountPercentage)}%</span>}
    </div>
    <div className="px-2 pb-2 pt-4">
      <p className="text-xs capitalize tracking-wide text-muted">{product.category}</p>
      <h3 className="mt-1 min-h-10 line-clamp-2 text-sm font-semibold text-ink">{product.title}</h3>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted"><Star size={13} className="fill-accent text-accent" /> {product.rating.toFixed(1)} <span>·</span> {product.stock > 0 ? "In stock" : "Out of stock"}</div>
      <div className="mt-4 flex items-center justify-between gap-2"><span className="font-bold">{formatINR(product.price * 85)}</span><Button aria-label={`Add ${product.title} to cart`} disabled={product.stock < 1} className="!px-3 !py-2" onClick={() => addItem(product)}><ShoppingBag size={16} /></Button></div>
    </div>
  </article>;
}
