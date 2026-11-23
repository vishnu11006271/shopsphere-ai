"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Minus, Plus, RefreshCw, ShoppingBag, Trash2, Bookmark, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommerceLinks } from "@/features/cart/components/commerce-links";
import { productKeys, productService } from "@/features/products/services/product-service";
import { useCartStore, type CartLine } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { calculateCartTotals, formatAmount, samePrice, unitPriceINR, validateCoupon } from "@/features/cart/utils/cart";
import type { Product, ProductVariant } from "@/types/product";

type LineStatus = { line: CartLine; current?: Product; currentVariant?: ProductVariant; unavailable: boolean; stock: number; priceChanged: boolean };
function resolveLines(lines: CartLine[], products: Product[] | undefined, hasFreshData: boolean): LineStatus[] {
  const byId = new Map((products ?? []).map((product) => [product.id, product]));
  return lines.map((line) => {
    const current = byId.get(line.product.id);
    if (!hasFreshData) return { line, current, unavailable: false, stock: line.variant?.stock ?? line.product.stock, priceChanged: false };
    if (!current) return { line, unavailable: true, stock: 0, priceChanged: false };
    const currentVariant = line.variant ? current.variants?.find((item) => item.id === line.variant?.id) : undefined;
    const variantMissing = Boolean(line.variant && !currentVariant);
    const stock = variantMissing ? 0 : currentVariant?.stock ?? current.stock;
    return { line, current, currentVariant, unavailable: variantMissing || stock < 1, stock, priceChanged: !samePrice(line.product, current) };
  });
}

function CartLineCard({ item, onRemove, onSave, onQuantity, onConfirmPrice, onWishlist }: {
  item: LineStatus; onRemove: () => void; onSave: () => void; onQuantity: (quantity: number) => void;
  onConfirmPrice: () => void; onWishlist: () => void;
}) {
  const { line, current, unavailable, stock, priceChanged } = item;
  const product = current ?? line.product;
  const maxStock = item.unavailable ? 0 : stock;
  const [notice, setNotice] = useState("");
  const displayPrice = unitPriceINR({ product, quantity: 1 });
  const oldPrice = unitPriceINR({ product: line.product, quantity: 1 });
  return <article className="grid gap-4 rounded-3xl bg-white p-4 shadow-soft sm:grid-cols-[112px_minmax(0,1fr)] sm:p-5">
    <Link href={`/products/${line.product.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-[#f0f1eb] sm:w-28"><Image src={product.thumbnail || line.product.thumbnail} alt={product.title} fill sizes="112px" className="object-contain p-3"/></Link>
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-brand">{product.brand || product.category}</p><Link href={`/products/${line.product.id}`} className="mt-1 block font-semibold leading-5 hover:text-brand">{product.title}</Link>{line.variant&&<p className="mt-1 text-xs text-muted">{line.variant.name}: {line.variant.value}</p>}</div><button type="button" onClick={onRemove} aria-label={`Remove ${product.title} from cart`} className="rounded-full p-2 text-muted hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17}/></button></div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><span className="font-bold">{formatAmount(displayPrice)}</span>{priceChanged&&<span className="text-xs text-muted line-through">{formatAmount(oldPrice)}</span>}{priceChanged&&<span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">Price changed</span>}</div>
      {unavailable ? <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">This item is no longer available or is out of stock. Remove it to continue.</p> :
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center rounded-full bg-canvas p-1"><button type="button" aria-label={`Decrease ${product.title} quantity`} disabled={line.quantity<=1} onClick={()=>{onQuantity(line.quantity-1);setNotice("");}} className="grid size-8 place-items-center rounded-full hover:bg-white disabled:opacity-35"><Minus size={14}/></button><span className="w-9 text-center text-sm font-semibold tabular-nums" aria-label="Quantity">{line.quantity}</span><button type="button" aria-label={`Increase ${product.title} quantity`} disabled={maxStock<1} onClick={()=>{if(line.quantity+1>maxStock){setNotice(`Only ${maxStock} available. Quantity was limited to available stock.`);onQuantity(maxStock);}else{onQuantity(line.quantity+1);setNotice("");}}} className="grid size-8 place-items-center rounded-full hover:bg-white disabled:opacity-35"><Plus size={14}/></button></div><span className="text-sm font-bold">{formatAmount(displayPrice*line.quantity)}</span></div>}
      {notice&&<p role="status" className="mt-2 text-xs text-amber-700">{notice}</p>}
      {priceChanged&&!unavailable&&<div className="mt-3 rounded-xl bg-amber-50 p-3"><p className="text-xs leading-5 text-amber-900">The catalogue price has changed. Review the new price and confirm before checkout.</p><Button className="mt-2 !px-3 !py-2" onClick={onConfirmPrice}>Accept new price</Button></div>}
      <div className="mt-3 flex flex-wrap gap-4 text-xs"><button type="button" onClick={onSave} className="inline-flex items-center gap-1 font-semibold text-muted hover:text-brand"><Bookmark size={13}/> Save for later</button><button type="button" onClick={onWishlist} className="font-semibold text-muted hover:text-brand">Move to wishlist</button></div>
    </div>
  </article>;
}

export function CartPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: productKeys.catalogue,
    queryFn: ({ signal }) => productService.getAll(signal),
  });
  const items = useCartStore((state) => state.items);
  const savedItems = useCartStore((state) => state.savedItems);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const moveToSaved = useCartStore((state) => state.moveToSaved);
  const moveSavedToCart = useCartStore((state) => state.moveSavedToCart);
  const removeSavedItem = useCartStore((state) => state.removeSavedItem);
  const updateProductSnapshot = useCartStore((state) => state.updateProductSnapshot);
  const couponCode = useCartStore((state) => state.couponCode);
  const setCouponCode = useCartStore((state) => state.setCouponCode);
  const addToWishlist = useWishlistStore((state) => state.add);
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [stockMessage, setStockMessage] = useState("");

  const statuses = useMemo(() => resolveLines(items, data?.products, Boolean(data)), [items, data]);
  const savedStatuses = useMemo(() => resolveLines(savedItems, data?.products, Boolean(data)), [savedItems, data]);
  const totals = useMemo(() => calculateCartTotals(statuses.map((status) => ({
    ...status.line, product: status.current ?? status.line.product,
    variant: status.currentVariant ?? status.line.variant,
  })), couponCode), [statuses, couponCode]);

  useEffect(() => {
    if (!data) return;
    for (const status of statuses) {
      if (status.unavailable) continue;
      if (status.line.quantity > status.stock && status.stock > 0) {
        setQuantity(status.line.product.id, status.stock, status.line.variant?.id);
        setStockMessage(`${status.line.product.title} quantity was reduced to the ${status.stock} currently available.`);
      }
    }
  }, [data, statuses, setQuantity]);

  const applyCoupon = () => {
    const result = validateCoupon(couponInput, totals.subtotal);
    if (!result.valid) { setCouponError(true); setCouponMessage(result.message); return; }
    setCouponCode(result.coupon.code);
    setCouponError(false);
    setCouponMessage(result.message);
  };
  const priceChangedCount = statuses.filter((item) => item.priceChanged).length;
  const blocked = isError || statuses.some((item) => item.unavailable || item.priceChanged) || items.length === 0;
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartCategories = new Set(items.map((item) => item.product.category));
  const addOns = (data?.products ?? []).filter((product) => product.stock > 0 && !items.some((line) => line.product.id === product.id) && cartCategories.has(product.category)).slice(0,4);

  if (!hasHydrated || (isPending && items.length === 0)) return <main className="mx-auto max-w-6xl px-5 py-10"><div className="h-8 w-48 animate-pulse rounded bg-stone-200"/><div className="mt-8 h-48 animate-pulse rounded-3xl bg-white"/></main>;

  return <main className="mx-auto max-w-6xl px-5 pb-16 pt-8">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm font-black tracking-tight">shop<span className="text-brand">sphere</span><span className="ml-1 text-[10px] text-brand">AI</span></Link><h1 className="mt-4 text-3xl font-semibold tracking-tight">Your cart</h1><p className="mt-1 text-sm text-muted">{cartCount} {cartCount===1?"item":"items"} in your bag</p></div><CommerceLinks cartCount={cartCount} wishlistCount={wishlistCount}/></header>
    {isError&&<div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div><p className="font-semibold">We couldn&apos;t refresh product availability.</p><p className="mt-1 text-xs">Showing your last-saved cart details. Retry before proceeding to checkout.</p></div><Button variant="secondary" onClick={()=>void refetch()}><RefreshCw size={15}/> Retry</Button></div>}
    {stockMessage&&<p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{stockMessage}</p>}
    {items.length===0 ? <section className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-soft"><div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8eee7] text-brand"><ShoppingBag size={28}/></div><h2 className="mt-5 text-xl font-semibold">Your cart is taking a little break</h2><p className="mt-2 text-sm text-muted">Find something you love and it will show up here.</p><Link href="/products" className="mt-6 inline-flex"><Button>Browse products <ArrowRight size={16}/></Button></Link></section> :
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4" aria-label="Cart items">
          {statuses.map((status)=><CartLineCard key={`${status.line.product.id}-${status.line.variant?.id??"base"}`} item={status}
            onRemove={()=>removeItem(status.line.product.id,status.line.variant?.id)}
            onSave={()=>moveToSaved(status.line.product.id,status.line.variant?.id)}
            onQuantity={(quantity)=>setQuantity(status.line.product.id,quantity,status.line.variant?.id)}
            onConfirmPrice={()=>{if(status.current)updateProductSnapshot(status.current,status.currentVariant);}}
            onWishlist={()=>{addToWishlist(status.current??status.line.product);removeItem(status.line.product.id,status.line.variant?.id);}}/>)}
          {savedStatuses.length>0&&<section className="mt-8 rounded-3xl bg-[#e8eee7] p-5"><h2 className="text-lg font-semibold">Saved for later <span className="text-sm font-normal text-muted">({savedStatuses.length})</span></h2><div className="mt-4 space-y-3">{savedStatuses.map((status)=><div key={`${status.line.product.id}-${status.line.variant?.id??"base"}`} className="flex items-center gap-3 rounded-2xl bg-white p-3"><div className="relative size-16 shrink-0 rounded-xl bg-canvas"><Image src={(status.current??status.line.product).thumbnail} alt="" fill sizes="64px" className="object-contain p-2"/></div><div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-semibold">{(status.current??status.line.product).title}</p><p className="text-xs text-muted">{formatAmount(unitPriceINR({product:status.current??status.line.product,quantity:1}))}</p></div><button type="button" disabled={status.unavailable} onClick={()=>moveSavedToCart(status.line.product.id,status.line.variant?.id)} className="text-xs font-semibold text-brand disabled:text-muted">Move to cart</button><button type="button" aria-label="Remove saved item" onClick={()=>removeSavedItem(status.line.product.id,status.line.variant?.id)} className="rounded-full p-2 text-muted hover:text-rose-600"><Trash2 size={15}/></button></div>)}</div></section>}
          {addOns.length>0&&<section className="pt-6"><div className="mb-4"><h2 className="text-lg font-semibold">Because of your cart</h2><p className="mt-1 text-xs text-muted">More in the categories already in your bag. Full Cart-Based recommendation scoring arrives in Phase 07.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{addOns.map((product)=><article key={product.id} className="rounded-2xl bg-white p-3 shadow-soft"><Link href={`/products/${product.id}`} className="relative block aspect-square rounded-xl bg-canvas"><Image src={product.thumbnail} alt={product.title} fill sizes="150px" className="object-contain p-3"/></Link><p className="mt-2 line-clamp-2 min-h-9 text-xs font-semibold">{product.title}</p><p className="mt-1 text-xs font-bold">{formatAmount(unitPriceINR({product,quantity:1}))}</p><button type="button" onClick={()=>useCartStore.getState().addItem(product)} className="mt-2 text-xs font-semibold text-brand">Add to cart</button></article>)}</div></section>}
        </section>
        <aside className="h-fit rounded-3xl bg-white p-5 shadow-soft lg:sticky lg:top-6"><h2 className="text-lg font-semibold">Order summary</h2><div className="mt-5 flex gap-2"><label htmlFor="coupon-code" className="sr-only">Coupon code</label><input id="coupon-code" value={couponInput} onChange={(event)=>setCouponInput(event.target.value.toUpperCase())} placeholder="Coupon code" className="min-w-0 flex-1 rounded-xl border border-black/10 bg-canvas px-3 py-3 text-sm outline-none focus:border-brand"/><Button variant="secondary" onClick={applyCoupon}>Apply</Button></div>{couponMessage&&<p role="status" className={`mt-2 text-xs ${couponError?"text-rose-600":"text-emerald-700"}`}>{couponMessage}</p>}{totals.coupon&&!totals.coupon.valid&&<p role="status" className="mt-2 text-xs text-rose-600">{totals.coupon.message}</p>}{couponCode&&<button type="button" onClick={()=>{setCouponCode(null);setCouponMessage("Coupon removed.");setCouponError(false);}} className="mt-2 text-xs font-semibold text-muted underline">Remove {couponCode}</button>}
          <div className="mt-6 space-y-3 border-t border-black/5 pt-5 text-sm"><div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatAmount(totals.subtotal)}</span></div><div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-emerald-700">−{formatAmount(totals.discount)}</span></div><div className="flex justify-between"><span className="text-muted">Shipping</span><span>{totals.shipping===0?"Free":formatAmount(totals.shipping)}</span></div><div className="flex justify-between"><span className="text-muted">Estimated tax (5%)</span><span>{formatAmount(totals.tax)}</span></div><div className="flex justify-between border-t border-black/5 pt-4 text-base font-bold"><span>Total</span><span>{formatAmount(totals.total)}</span></div></div>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-muted"><Truck size={14}/> {totals.shipping===0?"You unlocked free simulated shipping.":`Free simulated shipping over ${formatAmount(2499)}.`}</p><p className="mt-2 flex items-center gap-2 text-[11px] text-muted"><ShieldCheck size={14}/> Simulated tax and shipping — no payment is collected here.</p>
          {blocked&&<p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{isError?"Refresh product availability before checkout. ":priceChangedCount>0?"Confirm changed prices before checkout. ":""}Remove unavailable items to continue.</p>}
          <Button disabled={blocked} className="mt-5 w-full" onClick={()=>{window.location.href="/checkout";}}>Continue to checkout <ArrowRight size={16}/></Button>
          <p className="mt-3 text-center text-[10px] leading-4 text-muted">Checkout is a protected simulated flow planned for Phase 06.</p>
        </aside>
      </div>}
  </main>;
}
