"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/utils";
import { useRecommendations } from "../hooks/use-recommendations";
import { useRecommendationAnalyticsStore } from "../store/recommendation-analytics-store";
import type { Product } from "@/types/product";
import type { RecommendationStrategy } from "../types";

const strategyNames:Record<RecommendationStrategy,string>={
  "recently-viewed":"Recently Viewed","similar-products":"Similar Products","category-based":"Picked by Category",
  "price-based":"Within Your Price Range","wishlist-based":"Because of Your Wishlist","cart-based":"Because of Your Cart",
  "frequently-bought-together":"Frequently Bought Together","trending":"Trending Products","personalized":"Recommended For You",
};
export function RecommendationRail({strategy,title,note,currentProduct,category,limit=4,enabled=true}:{
  strategy:RecommendationStrategy;title?:string;note?:string;currentProduct?:Product;category?:string;limit?:number;enabled?:boolean;
}) {
  const query=useRecommendations({strategy,currentProduct,category,limit,enabled});
  const fallback=useRecommendations({strategy:"trending",limit,enabled:query.isError&&strategy!=="trending"});
  const items=query.isError&&strategy!=="trending"?fallback.data??[]:query.data??[];
  const recordImpression=useRecommendationAnalyticsStore((state)=>state.recordImpression);
  const recordClick=useRecommendationAnalyticsStore((state)=>state.recordClick);
  const recordAddToCart=useRecommendationAnalyticsStore((state)=>state.recordAddToCart);
  const addItem=useCartStore((state)=>state.addItem);
  const activeStrategy=query.isError&&strategy!=="trending"?"trending":strategy;
  useEffect(()=>{if(items.length)recordImpression(activeStrategy,items.map((item)=>item.product.id));},[activeStrategy,items,recordImpression]);
  if(!enabled||(!query.isPending&&!items.length))return null;
  return <section className="mt-12 border-t border-black/5 pt-9" aria-label={title??strategyNames[strategy]}>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-brand"><Sparkles size={13}/>{query.isError?"Popular fallback":"Signal-based picks"}</p><h2 className="mt-2 text-xl font-semibold tracking-tight">{title??strategyNames[strategy]}</h2><p className="mt-1 text-xs text-muted">{note??"Suggestions are ranked from local browsing and shopping signals."}</p></div><Link href="/account#recommendation-preferences" className="inline-flex items-center gap-1 text-xs font-semibold text-brand">Why these? <ArrowRight size={13}/></Link></div>
    {query.isPending&&!items.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({length:limit}).map((_,i)=><div key={i} className="h-64 animate-pulse rounded-2xl bg-white"/> )}</div>:
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map(({product,score,reasons})=><article key={product.id} className="rounded-2xl bg-white p-3 shadow-soft">
      <Link href={"/products/"+product.id} onClick={()=>recordClick(activeStrategy,product.id)} className="group block"><div className="relative aspect-square overflow-hidden rounded-xl bg-canvas"><Image src={product.thumbnail} alt={product.title} fill sizes="(max-width:640px) 45vw, 220px" className="object-contain p-3 transition group-hover:scale-105"/></div><p className="mt-3 line-clamp-2 min-h-10 text-xs font-semibold">{product.title}</p></Link>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-bold">{formatINR(product.price*85)}</span><span className="inline-flex items-center gap-1 text-[10px] text-muted"><Star size={11} className="fill-accent text-accent"/>{product.rating.toFixed(1)}</span></div>
      {reasons[0]&&<p className="mt-2 line-clamp-2 text-[10px] leading-4 text-brand" title={reasons.map((reason)=>reason.label+": "+reason.detail).join("; ")}>{reasons[0].label}</p>}
      <Button variant="secondary" className="mt-3 w-full !px-2 !py-2 text-xs" disabled={product.stock<1} onClick={()=>{addItem(product);recordAddToCart(activeStrategy,product.id);}}>Add to cart</Button>
      <span className="sr-only">Recommendation score {Math.round(score*100)} percent</span>
    </article>)}</div>}
  </section>;
}
