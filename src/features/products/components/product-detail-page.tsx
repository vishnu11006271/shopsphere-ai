"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Info, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { productKeys, productService } from "@/features/products/services/product-service";
import { clampProductQuantity, estimateDelivery, getDiscountedPrice, getSelectedStock } from "@/features/products/utils/product-detail";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/product";

type Tab = "description" | "specifications";

function ProductRail({ title, note, products }: { title: string; note: string; products: Product[] }) {
  if (!products.length) return null;
  return <section className="mt-14 border-t border-black/5 pt-10">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-xl font-bold tracking-tight">{title}</h2><p className="mt-1 text-xs text-muted">{note}</p></div><span className="rounded-full bg-[#e9efe8] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">Preview rail</span></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {products.slice(0,4).map((item) => <Link key={item.id} href={`/products/${item.id}`} className="group rounded-2xl bg-white p-3 shadow-soft transition hover:-translate-y-0.5">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f0f1eb]"><Image src={item.thumbnail} alt={item.title} fill sizes="(max-width:640px) 45vw, 220px" className="object-contain p-3 transition group-hover:scale-105"/></div>
        <p className="mt-3 line-clamp-2 min-h-10 text-xs font-semibold">{item.title}</p><p className="mt-2 text-sm font-bold">{formatINR(item.price * 85)}</p>
      </Link>)}
    </div>
  </section>;
}

function ReviewSection({ product }: { product: Product }) {
  const reviews = product.reviews ?? [];
  return <section className="mt-14 border-t border-black/5 pt-10" id="reviews">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-xl font-bold">Customer reviews</h2><p className="mt-1 text-sm text-muted">Ratings and comments supplied with the product catalogue.</p></div>
      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-soft"><Star className="fill-accent text-accent" size={20}/><span className="text-2xl font-bold">{product.rating.toFixed(1)}</span><span className="text-xs text-muted">/ 5</span></div>
    </div>
    {reviews.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{reviews.map((review, index) => <article key={`${review.reviewerName}-${index}`} className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{review.reviewerName}</p><span className="flex items-center gap-1 text-xs text-muted"><Star size={12} className="fill-accent text-accent"/>{review.rating}/5</span></div>
      <p className="mt-3 text-sm leading-6 text-muted">{review.comment}</p><p className="mt-3 text-[11px] text-muted">{new Date(review.date).toLocaleDateString()}</p>
    </article>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white/60 p-6 text-sm text-muted">No written reviews are available from the catalogue for this product yet.</div>}
  </section>;
}

export function ProductDetailPage({ productId }: { productId: number }) {
  const router = useRouter();
  const { data: product, isPending, isError, refetch } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) => productService.getById(productId, signal),
    enabled: Number.isSafeInteger(productId) && productId > 0,
  });
  const { data: relatedData } = useQuery({
    queryKey: productKeys.related(product?.category ?? "", productId),
    queryFn: ({ signal }) => productService.getByCategory(product!.category, signal),
    enabled: Boolean(product?.category),
  });
  const { data: catalogueData } = useQuery({ queryKey: productKeys.catalogue, queryFn: ({ signal }) => productService.getAll(signal), enabled: Boolean(product) });
  const { data: featuredData } = useQuery({ queryKey: productKeys.featured, queryFn: ({ signal }) => productService.getFeatured(signal), enabled: Boolean(product) });
  const addItem = useCartStore((state) => state.addItem);
  const saved = useWishlistStore((state) => state.productIds.includes(productId));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);

  const variant = product?.variants?.find((item) => item.id === selectedVariantId) ?? product?.variants?.find((item) => item.stock > 0) ?? product?.variants?.[0];
  const availableStock = product ? getSelectedStock(product, variant) : 0;
  const images = useMemo(() => product ? Array.from(new Set([product.thumbnail, ...product.images].filter(Boolean))) : [], [product]);
  const related = useMemo(() => (relatedData?.products ?? []).filter((item) => item.id !== productId), [relatedData, productId]);
  const similar = useMemo(() => related.filter((item) => item.tags?.some((tag) => product?.tags?.includes(tag))), [related, product]);
  const boughtTogether = useMemo(() => (catalogueData?.products ?? []).filter((item) => item.id !== productId && item.category !== product?.category).slice(0,4), [catalogueData, productId, product]);
  const recommended = useMemo(() => (featuredData?.products ?? []).filter((item) => item.id !== productId).slice(0,4), [featuredData, productId]);

  if (isPending) return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="h-5 w-32 animate-pulse rounded bg-stone-200"/><div className="mt-8 grid gap-8 lg:grid-cols-2"><div className="aspect-square animate-pulse rounded-3xl bg-stone-200"/><div className="space-y-4"><div className="h-8 w-3/4 animate-pulse rounded bg-stone-200"/><div className="h-5 w-1/3 animate-pulse rounded bg-stone-200"/><div className="h-32 animate-pulse rounded bg-stone-200"/></div></div></main>;
  if (isError || !product) return <main className="mx-auto grid min-h-[65vh] max-w-xl place-content-center px-5 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-600"><Info/></div><h1 className="mt-5 text-2xl font-bold">We couldn&apos;t load this product</h1><p className="mt-2 text-sm text-muted">The product may be unavailable, or the connection may have failed.</p><div className="mt-6 flex justify-center gap-3"><Button variant="secondary" onClick={() => router.back()}>Go back</Button><Button onClick={() => void refetch()}>Try again</Button></div></main>;

  const stockLabel = availableStock > 0 ? `${availableStock} available` : "Out of stock";
  const addToCart = () => { if (availableStock < 1) return; addItem(product, variant, quantity); };
  const buyNow = () => { if (availableStock < 1) return; addItem(product, variant, quantity); router.push("/checkout"); };
  const changeQuantity = (next: number) => setQuantity(clampProductQuantity(next, availableStock, product.minimumOrderQuantity ?? 1));
  const deliveryCheck = () => setDeliveryMessage(estimateDelivery(pincode).message);
  const currentImage = images[activeImage] ?? product.thumbnail;

  return <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
    <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand"><ArrowLeft size={16}/> Back to products</Link>
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-12">
      <section className="min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-soft">
          <button type="button" className="absolute inset-0 z-0 cursor-zoom-in" aria-label="Open product image zoom" onClick={() => setZoomOpen(true)}><Image src={currentImage} alt={product.title} fill priority sizes="(max-width:1024px) 100vw, 55vw" className="object-contain p-8 sm:p-12"/></button>
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold capitalize text-ink">{product.category}</span>
          {images.length > 1 && <><button type="button" aria-label="Previous image" onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronLeft/></button><button type="button" aria-label="Next image" onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronRight/></button></>}
        </div>
        {images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">{images.slice(0,6).map((src,index)=><button key={src} type="button" onClick={()=>setActiveImage(index)} aria-label={`View product image ${index+1}`} aria-pressed={activeImage===index} className={`relative aspect-square overflow-hidden rounded-xl bg-white ${activeImage===index?"ring-2 ring-brand ring-offset-2":"opacity-70 hover:opacity-100"}`}><Image src={src} alt="" fill sizes="100px" className="object-contain p-2"/></button>)}</div>}
      </section>
      <section className="lg:pt-2">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-brand">{product.brand || "ShopSphere selection"}</p><h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.title}</h1></div><button type="button" onClick={()=>toggleWishlist(product.id)} aria-label={saved?"Remove from wishlist":"Add to wishlist"} aria-pressed={saved} className="shrink-0 rounded-full bg-white p-3 text-ink shadow-soft hover:text-rose-600"><Heart className={saved?"fill-rose-500 text-rose-500":""}/></button></div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span className="flex items-center gap-1 font-semibold"><Star size={16} className="fill-accent text-accent"/>{product.rating.toFixed(1)}</span><a href="#reviews" className="text-muted underline-offset-4 hover:underline">{product.reviews?.length ?? 0} catalogue reviews</a><span className="text-muted">·</span><span className={availableStock>0?"text-emerald-700":"text-rose-600"}>{stockLabel}</span></div>
        <div className="mt-6 flex flex-wrap items-baseline gap-3"><span className="text-3xl font-bold">{formatINR(getDiscountedPrice(product)*85)}</span>{product.discountPercentage>0&&<><span className="text-lg text-muted line-through">{formatINR(product.price*85)}</span><span className="rounded-full bg-[#f4e7d1] px-3 py-1 text-xs font-bold text-[#8b5a13]">Save {Math.round(product.discountPercentage)}%</span></>}</div>
        <p className="mt-3 text-xs text-muted">Displayed INR amount is an illustrative conversion of the mock catalogue price, not a live exchange-rate quote.</p>
        <div className="mt-7 border-t border-black/10 pt-6">
          {product.variants?.length ? <div><p className="text-sm font-semibold">Choose a variant</p><div className="mt-3 flex flex-wrap gap-2">{product.variants.map((item)=><button key={item.id} type="button" disabled={item.stock<1} aria-pressed={selectedVariantId===item.id || (!selectedVariantId && variant?.id===item.id)} onClick={()=>{setSelectedVariantId(item.id);setQuantity(1);}} className={`rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${selectedVariantId===item.id?"border-brand bg-brand text-white":"border-black/15 bg-white hover:border-brand"}`}>{item.value}{item.stock<1?" · Unavailable":""}</button>)}</div></div> : <p className="text-sm text-muted">No selectable variants are supplied for this catalogue item.</p>}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Quantity</p><p className="mt-1 text-xs text-muted">{stockLabel}</p></div><div className="flex items-center rounded-full bg-white p-1 shadow-soft"><button type="button" aria-label="Decrease quantity" disabled={quantity<=1||availableStock<1} onClick={()=>changeQuantity(quantity-1)} className="grid size-9 place-items-center rounded-full hover:bg-canvas disabled:opacity-35"><Minus size={15}/></button><span className="w-10 text-center text-sm font-semibold" aria-live="polite">{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity>=availableStock} onClick={()=>changeQuantity(quantity+1)} className="grid size-9 place-items-center rounded-full hover:bg-canvas disabled:opacity-35"><Plus size={15}/></button></div></div>
          {availableStock<1&&<p role="status" className="mt-3 text-sm font-medium text-rose-600">This selection is out of stock. Choose an available variant if one is listed.</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><Button disabled={availableStock<1} onClick={addToCart} className="w-full"><ShoppingBag size={17}/> Add to Cart</Button><Button variant="secondary" disabled={availableStock<1} onClick={buyNow} className="w-full">Buy Now</Button></div>
        </div>
        <div className="mt-7 rounded-2xl bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2"><Truck size={18} className="text-brand"/><h2 className="text-sm font-bold">Delivery estimate</h2></div>
          <p className="mt-2 text-xs leading-5 text-muted">{product.shippingInformation || "Standard delivery estimate is calculated locally for demonstration."}</p>
          <div className="mt-4 flex gap-2"><label className="sr-only" htmlFor="delivery-pincode">Delivery pincode</label><input id="delivery-pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(event)=>{setPincode(event.target.value.replace(/\D/g,""));setDeliveryMessage("");}} placeholder="Enter 6-digit pincode" className="min-w-0 flex-1 rounded-xl border border-black/10 bg-canvas px-4 py-3 text-sm outline-none focus:border-brand"/><Button variant="secondary" onClick={deliveryCheck}>Check</Button></div>
          {deliveryMessage&&<p role="status" className={`mt-3 text-xs ${deliveryMessage.startsWith("Enter")?"text-rose-600":"text-emerald-700"}`}>{deliveryMessage}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted"><span className="flex items-center gap-1"><PackageCheck size={14}/> Stock-aware dispatch</span><span className="flex items-center gap-1"><ShieldCheck size={14}/> Secure checkout simulation</span></div>
        </div>
        <div className="mt-7">
          <div className="flex border-b border-black/10"><button type="button" onClick={()=>setActiveTab("description")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeTab==="description"?"border-brand text-brand":"border-transparent text-muted"}`}>Description</button><button type="button" onClick={()=>setActiveTab("specifications")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeTab==="specifications"?"border-brand text-brand":"border-transparent text-muted"}`}>Specifications</button></div>
          {activeTab==="description"?<div className="py-5 text-sm leading-7 text-muted">{product.description}<p className="mt-3 text-xs">Returns: {product.returnPolicy || "Refer to the seller's return policy."}</p>{product.warrantyInformation&&<p className="mt-2 text-xs">Warranty: {product.warrantyInformation}</p>}</div>:<dl className="grid grid-cols-2 gap-3 py-5 text-sm">{[["Brand",product.brand],["Category",product.category],["SKU",product.sku],["Weight",product.weight? `${product.weight} g`:undefined],["Dimensions",product.dimensions? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`:undefined],["Availability",product.availabilityStatus],["Minimum order",product.minimumOrderQuantity?.toString()]].filter((entry)=>Boolean(entry[1])).map(([label,value])=><div key={label as string} className="rounded-xl bg-white p-3"><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 font-semibold capitalize">{value}</dd></div>)}</dl>}
        </div>
      </section>
    </div>
    <ReviewSection product={product}/>
    <ProductRail title="Related Products" note="Same-category catalogue items. Strategy-specific recommendation scoring will be introduced in Phase 07." products={related}/>
    <ProductRail title="Similar Products" note="A tag-overlap preview, kept separate from the related-category rail." products={similar}/>
    <ProductRail title="Frequently Bought Together" note="Cross-category catalogue suggestions shown as a placeholder until mock co-occurrence data is implemented." products={boughtTogether}/>
    <ProductRail title="Recommended For You" note="Popular catalogue preview only; personalized signal scoring will be implemented in Phase 07." products={recommended}/>
    {zoomOpen&&<div role="dialog" aria-modal="true" aria-label="Product image zoom" onClick={()=>setZoomOpen(false)} className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"><button type="button" onClick={()=>setZoomOpen(false)} className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold">Close</button><div className="relative h-[80vh] w-full max-w-4xl"><Image src={currentImage} alt={product.title} fill sizes="90vw" className="object-contain"/></div></div>}
  </main>;
}
