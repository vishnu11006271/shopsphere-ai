"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommerceLinks } from "@/features/cart/components/commerce-links";
import { formatAmount, unitPriceINR } from "@/features/cart/utils/cart";
import { productKeys, productService } from "@/features/products/services/product-service";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import type { Product } from "@/types/product";

export function WishlistPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: productKeys.catalogue,
    queryFn: ({ signal }) => productService.getAll(signal),
  });
  const productIds = useWishlistStore((state) => state.productIds);
  const snapshots = useWishlistStore((state) => state.productSnapshots);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);
  const remove = useWishlistStore((state) => state.remove);
  const saveProduct = useWishlistStore((state) => state.saveProduct);
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const snapshotById = useMemo(() => new Map(snapshots.map((item) => [item.id, item])), [snapshots]);
  const liveById = useMemo(() => new Map((data?.products ?? []).map((item) => [item.id, item])), [data]);
  const wishlistProducts = productIds.map((id) => ({ id, product: liveById.get(id) ?? snapshotById.get(id), isMissing: Boolean(data && !liveById.has(id)) }));
  const categories = new Set(wishlistProducts.map((entry) => entry.product?.category).filter(Boolean));
  const suggestions = (data?.products ?? []).filter((product) => product.stock > 0 && !productIds.includes(product.id) && categories.has(product.category)).slice(0,4);

  if (!hasHydrated || (isPending && productIds.length === 0)) return <main className="mx-auto max-w-6xl px-5 py-10"><div className="h-8 w-48 animate-pulse rounded bg-stone-200"/><div className="mt-8 h-48 animate-pulse rounded-3xl bg-white"/></main>;

  return <main className="mx-auto max-w-6xl px-5 pb-16 pt-8">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm font-black tracking-tight">shop<span className="text-brand">sphere</span><span className="ml-1 text-[10px] text-brand">AI</span></Link><h1 className="mt-4 text-3xl font-semibold tracking-tight">Your wishlist</h1><p className="mt-1 text-sm text-muted">{productIds.length} saved {productIds.length===1?"product":"products"}</p></div><CommerceLinks cartCount={cartCount} wishlistCount={productIds.length}/></header>
    {isError&&<div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><div><p className="font-semibold">We couldn&apos;t refresh your saved products.</p><p className="mt-1 text-xs">Showing last-known product details where available. Stock could not be verified.</p></div><Button variant="secondary" onClick={()=>void refetch()}><RefreshCw size={15}/> Retry</Button></div>}
    {productIds.length===0 ? <section className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-soft"><div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8eee7] text-brand"><Heart size={28}/></div><h2 className="mt-5 text-xl font-semibold">Nothing saved just yet</h2><p className="mt-2 text-sm text-muted">Tap the heart on a product to keep it close.</p><Link href="/products" className="mt-6 inline-flex"><Button>Browse products <ArrowRight size={16}/></Button></Link></section> :
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{wishlistProducts.map(({id,product,isMissing})=>{
        const outOfStock = !product || product.stock<1 || isMissing;
        return <article key={id} className="overflow-hidden rounded-3xl bg-white p-4 shadow-soft">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-canvas">{product&&<Image src={product.thumbnail} alt={product.title} fill sizes="(max-width:640px) 90vw, 320px" className="object-contain p-5"/>}<span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold ${outOfStock?"bg-rose-50 text-rose-700":"bg-emerald-50 text-emerald-700"}`}>{isMissing?"No longer listed":outOfStock?"Out of stock":"In stock"}</span></div>
          <div className="pt-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-brand">{product?.brand??product?.category??"Saved product"}</p><h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold">{product?.title??`Product #${id}`}</h2><p className="mt-3 font-bold">{product?formatAmount(unitPriceINR({product,quantity:1})):"Price unavailable"}</p>
            {isError&&<p className="mt-2 text-[11px] text-amber-700">Last-known stock only; refresh to verify availability.</p>}
            <div className="mt-4 flex gap-2"><Button disabled={outOfStock} className="flex-1 !px-3" onClick={()=>{if(product){addItem(product);remove(id);}}}><ShoppingBag size={15}/> Move to cart</Button><button type="button" aria-label={`Remove saved product ${id}`} onClick={()=>remove(id)} className="rounded-full bg-canvas p-3 text-muted hover:text-rose-600"><Trash2 size={16}/></button></div>
            {product&&data&&<Link href={`/products/${id}`} className="mt-3 inline-block text-xs font-semibold text-brand">View details</Link>}
          </div>
        </article>;
      })}</section>}
    {suggestions.length>0&&<section className="mt-14 border-t border-black/5 pt-9"><div className="mb-5"><h2 className="text-xl font-semibold">Because of your Wishlist</h2><p className="mt-1 text-xs text-muted">More in categories represented by your saved items. Full Wishlist-Based recommendation scoring arrives in Phase 07.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{suggestions.map((product:Product)=><Link key={product.id} href={`/products/${product.id}`} className="rounded-2xl bg-white p-3 shadow-soft"><div className="relative aspect-square rounded-xl bg-canvas"><Image src={product.thumbnail} alt={product.title} fill sizes="160px" className="object-contain p-3"/></div><p className="mt-2 line-clamp-2 min-h-9 text-xs font-semibold">{product.title}</p><p className="mt-1 text-xs font-bold">{formatAmount(unitPriceINR({product,quantity:1}))}</p></Link>)}</div></section>}
  </main>;
}
