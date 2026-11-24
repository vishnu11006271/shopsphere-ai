"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, Boxes, ChevronRight, CircleDollarSign, ClipboardList, Eye, EyeOff, LayoutDashboard, MessageSquare, Package, Pencil, Plus, Search, ShieldCheck, ShoppingBag, Star, Trash2, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productKeys, productService } from "@/features/products/services/product-service";
import { useAdminCatalogStore } from "../store/admin-catalog-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCheckoutStore, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, type OrderStatus, type ShopOrder } from "@/features/checkout/store/checkout-store";
import { useRecommendationAnalyticsStore } from "@/features/recommendations/store/recommendation-analytics-store";
import { useReviewStore } from "@/features/reviews/store/review-store";
import type { Product, ProductCategory } from "@/types/product";

type Tab = "overview" | "products" | "orders" | "reviews" | "analytics";
type ProductDraft = { title: string; brand: string; category: string; price: string; discountPercentage: string; stock: string; description: string };
const emptyDraft: ProductDraft = { title: "", brand: "", category: "", price: "", discountPercentage: "0", stock: "0", description: "" };
const tabItems: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "analytics", label: "Recommendation analytics", icon: BarChart3 },
];
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted">{label}</span><span className="grid size-9 place-items-center rounded-xl bg-[#e8eee7] text-brand"><Icon size={17}/></span></div><p className="mt-4 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></article>;
}

function LocalNotice({ children = "Changes are saved in this browser only. They are not sent to a backend or shared with other devices." }: { children?: string }) {
  return <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><Activity size={14} className="mt-0.5 shrink-0"/><span><strong>Local simulation:</strong> {children}</span></p>;
}

function ProductManagement({ products, categories }: { products: Product[]; categories: ProductCategory[] }) {
  const queryClient = useQueryClient();
  const saveProduct = useAdminCatalogStore((state) => state.saveProduct);
  const deleteProduct = useAdminCatalogStore((state) => state.deleteProduct);
  const addCategory = useAdminCatalogStore((state) => state.addCategory);
  const renameCategory = useAdminCatalogStore((state) => state.renameCategory);
  const deleteCategory = useAdminCatalogStore((state) => state.deleteCategory);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [categoryName, setCategoryName] = useState("");
  const [renameSlug, setRenameSlug] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [message, setMessage] = useState("");

  const visible = useMemo(() => products.filter((product) =>
    (categoryFilter === "all" || product.category === categoryFilter) &&
    [product.title, product.brand ?? "", product.category, String(product.id)].some((value) => value.toLowerCase().includes(search.toLowerCase())),
  ), [products, categoryFilter, search]);

  function startEdit(product?: Product) {
    setFormOpen(true);
    setEditing(product ?? null);
    setDraft(product ? {
      title: product.title, brand: product.brand ?? "", category: product.category,
      price: String(product.price), discountPercentage: String(product.discountPercentage),
      stock: String(product.stock), description: product.description,
    } : { ...emptyDraft, category: categories[0]?.slug ?? "" });
    setMessage("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(draft.price), discount = Number(draft.discountPercentage), stock = Number(draft.stock);
    if (!draft.title.trim() || !draft.category || !Number.isFinite(price) || price <= 0 || !Number.isFinite(discount) || discount < 0 || discount > 100 || !Number.isInteger(stock) || stock < 0) {
      setMessage("Enter a title, category, positive price, discount from 0–100, and a non-negative whole-number stock quantity.");
      return;
    }
    const product: Product = {
      id: editing?.id ?? Math.max(0, ...products.map((item) => item.id)) + 1,
      title: draft.title.trim(), brand: draft.brand.trim() || undefined, category: draft.category,
      price, discountPercentage: discount, stock, description: draft.description.trim(),
      rating: editing?.rating ?? 0, thumbnail: editing?.thumbnail ?? products[0]?.thumbnail ?? "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
      images: editing?.images ?? [products[0]?.thumbnail ?? "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg"],
      tags: editing?.tags ?? [], availabilityStatus: stock > 0 ? "In Stock" : "Out of Stock",
    };
    saveProduct(product);
    void queryClient.invalidateQueries({ queryKey: productKeys.all });
    setEditing(null); setFormOpen(false); setDraft(emptyDraft); setMessage("Product saved to the local catalogue.");
  }

  function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!name || !slug || categories.some((item) => item.slug === slug)) return;
    addCategory({ slug, name, url: "" }); void queryClient.invalidateQueries({ queryKey: productKeys.categories }); setCategoryName(""); setMessage("Category added locally.");
  }

  return <div className="space-y-6">
    <LocalNotice>Product and category create, edit, and delete actions are stored in local application state and browser storage only. They are not durable server writes.</LocalNotice>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Catalogue management</h2><p className="mt-1 text-sm text-muted">{products.length} products in the current local view.</p></div><Button onClick={() => startEdit()}><Plus size={15}/> Add product</Button></div>
    {message && <p role="status" className="text-sm text-brand">{message}</p>}
    {formOpen ? <form onSubmit={save} className="grid gap-4 rounded-2xl border border-brand/20 bg-white p-5 shadow-soft md:grid-cols-2">
      <div className="md:col-span-2 flex items-center justify-between"><h3 className="font-bold">{editing ? "Edit product" : "Add product"}</h3><Button type="button" variant="ghost" onClick={() => { setEditing(null); setFormOpen(false); setDraft(emptyDraft); }}>Close</Button></div>
      <label className="text-xs font-semibold">Product title<input required value={draft.title} onChange={(event)=>setDraft({...draft,title:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"/></label>
      <label className="text-xs font-semibold">Brand<input value={draft.brand} onChange={(event)=>setDraft({...draft,brand:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"/></label>
      <label className="text-xs font-semibold">Category<select required value={draft.category} onChange={(event)=>setDraft({...draft,category:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 bg-white p-3 text-sm font-normal">{categories.map((category)=><option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
      <label className="text-xs font-semibold">Catalogue price (source units)<input type="number" min="0.01" step="0.01" required value={draft.price} onChange={(event)=>setDraft({...draft,price:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"/></label>
      <label className="text-xs font-semibold">Discount percentage<input type="number" min="0" max="100" step="0.1" value={draft.discountPercentage} onChange={(event)=>setDraft({...draft,discountPercentage:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"/></label>
      <label className="text-xs font-semibold">Inventory quantity<input type="number" min="0" step="1" required value={draft.stock} onChange={(event)=>setDraft({...draft,stock:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"/></label>
      <label className="text-xs font-semibold md:col-span-2">Description<textarea rows={3} value={draft.description} onChange={(event)=>setDraft({...draft,description:event.target.value})} className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"/></label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3"><Button type="submit">Save locally</Button><span className="text-xs text-muted">This does not update DummyJSON.</span></div>
    </form> : null}
    <div className="flex flex-wrap gap-3"><label className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-3.5 text-muted"/><input aria-label="Search products" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search title, brand or ID" className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-3 text-sm"/></label><select aria-label="Filter products by category" value={categoryFilter} onChange={(event)=>setCategoryFilter(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 text-sm"><option value="all">All categories</option>{categories.map((category)=><option key={category.slug} value={category.slug}>{category.name}</option>)}</select></div>
    <div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-canvas text-xs text-muted"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price*</th><th className="p-4">Stock</th><th className="p-4">Actions</th></tr></thead><tbody>{visible.map((product)=><tr key={product.id} className="border-t border-black/5"><td className="p-4"><p className="font-semibold">{product.title}</p><p className="mt-1 text-xs text-muted">#{product.id} · {product.brand ?? "No brand"}</p></td><td className="p-4 capitalize">{product.category.replace(/-/g," ")}</td><td className="p-4">{money(product.price*85)}</td><td className="p-4"><span className={product.stock<=5?"font-semibold text-rose-600":"text-muted"}>{product.stock}</span></td><td className="p-4"><div className="flex gap-2"><Button type="button" variant="secondary" onClick={()=>startEdit(product)}><Pencil size={13}/> Edit</Button><Button type="button" variant="ghost" onClick={()=>{if(window.confirm(`Remove ${product.title} from this local catalogue?`)){deleteProduct(product.id);void queryClient.invalidateQueries({queryKey:productKeys.all});}}}><Trash2 size={13}/> Delete</Button></div></td></tr>)}{visible.length===0&&<tr><td colSpan={5} className="p-8 text-center text-sm text-muted">No products match this search.</td></tr>}</tbody></table></div>
    <p className="text-[11px] text-muted">*Displayed amount uses the storefront's illustrative catalogue price × 85 conversion. It is not a live INR conversion.</p>
    <section className="rounded-2xl bg-white p-5 shadow-soft"><h3 className="font-bold">Category management</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><form onSubmit={createCategory} className="flex gap-2"><input aria-label="New category name" value={categoryName} onChange={(event)=>setCategoryName(event.target.value)} placeholder="New category name" className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm"/><Button type="submit" >Add</Button></form><div className="flex gap-2"><select aria-label="Category to rename" value={renameSlug} onChange={(event)=>{setRenameSlug(event.target.value);setRenameValue(categories.find((item)=>item.slug===event.target.value)?.name??"");}} className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-2 py-2 text-sm"><option value="">Select category</option>{categories.map((item)=><option key={item.slug} value={item.slug}>{item.name}</option>)}</select><input aria-label="Renamed category" value={renameValue} onChange={(event)=>setRenameValue(event.target.value)} placeholder="New name" className="min-w-0 flex-1 rounded-xl border border-black/10 px-2 py-2 text-sm"/><Button type="button" variant="secondary" disabled={!renameSlug||!renameValue.trim()} onClick={()=>{renameCategory(renameSlug,renameValue.trim());void queryClient.invalidateQueries({queryKey:productKeys.categories});setMessage("Category renamed locally.");}}>Rename</Button></div></div><div className="mt-4 flex flex-wrap gap-2">{categories.map((item)=><span key={item.slug} className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-2 text-xs">{item.name}<button type="button" aria-label={`Remove category ${item.name}`} disabled={products.some((product)=>product.category===item.slug)} title={products.some((product)=>product.category===item.slug)?"Reassign products before removing this category":"Remove local category"} onClick={()=>{deleteCategory(item.slug);void queryClient.invalidateQueries({queryKey:productKeys.categories});}} className="text-muted hover:text-rose-600 disabled:opacity-30">×</button></span>)}</div></section>
  </div>;
}

function OrderManagement({ orders }: { orders: ShopOrder[] }) {
  const advanceOrder = useCheckoutStore((state) => state.advanceOrder);
  const [status, setStatus] = useState("all");
  const [customer, setCustomer] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = orders.filter((order) =>
    (status === "all" || order.status === status) &&
    (customer === "" || [order.customer.name, order.customer.email, order.id].some((value)=>value.toLowerCase().includes(customer.toLowerCase()))) &&
    (!from || order.createdAt.slice(0,10)>=from) && (!to || order.createdAt.slice(0,10)<=to),
  );
  const selected = orders.find((order)=>order.id===selectedId);
  return <div className="space-y-5"><LocalNotice>Order status changes advance the existing local order timeline. No fulfilment partner, customer notification, or server is contacted.</LocalNotice><div><h2 className="text-xl font-bold">Order management</h2><p className="mt-1 text-sm text-muted">{orders.length} locally recorded orders.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><select aria-label="Filter orders by status" value={status} onChange={(event)=>setStatus(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"><option value="all">All statuses</option>{ORDER_STATUS_STEPS.map((item)=><option key={item} value={item}>{ORDER_STATUS_LABELS[item]}</option>)}</select><input aria-label="Search customer or order" value={customer} onChange={(event)=>setCustomer(event.target.value)} placeholder="Customer or order ID" className="rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"/><label className="text-xs text-muted">From<input aria-label="Order date from" type="date" value={from} onChange={(event)=>setFrom(event.target.value)} className="mt-1 block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"/></label><label className="text-xs text-muted">To<input aria-label="Order date to" type="date" value={to} onChange={(event)=>setTo(event.target.value)} className="mt-1 block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"/></label></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-canvas text-xs text-muted"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4"/></tr></thead><tbody>{visible.map((order)=><tr key={order.id} className="border-t border-black/5"><td className="p-4"><p className="font-mono text-xs font-bold">{order.id}</p><p className="mt-1 text-[11px] text-muted">{new Date(order.createdAt).toLocaleDateString()}</p></td><td className="p-4"><p className="font-semibold">{order.customer.name}</p><p className="text-xs text-muted">{order.customer.email}</p></td><td className="p-4"><span className="rounded-full bg-[#e8eee7] px-2 py-1 text-xs font-semibold text-brand">{ORDER_STATUS_LABELS[order.status]}</span></td><td className="p-4 font-semibold">{money(order.total)}</td><td className="p-4"><Button variant="secondary" onClick={()=>setSelectedId(order.id)}>Details <ChevronRight size={13}/></Button></td></tr>)}{visible.length===0&&<tr><td colSpan={5} className="p-8 text-center text-sm text-muted">No orders match the selected filters.</td></tr>}</tbody></table></div>
      <aside className="h-fit rounded-2xl bg-white p-5 shadow-soft">{selected ? <><div className="flex items-center justify-between"><h3 className="font-bold">{selected.id}</h3><button type="button" onClick={()=>setSelectedId(null)} className="text-xs text-muted">Close</button></div><p className="mt-2 text-sm font-semibold">{selected.customer.name}</p><p className="text-xs text-muted">{selected.customer.email}</p><div className="mt-4 space-y-3">{selected.items.map((item,index)=><div key={item.productId+"-"+index} className="flex justify-between gap-2 text-sm"><span>{item.title} × {item.quantity}</span><span className="font-semibold">{money(item.unitPrice*item.quantity)}</span></div>)}</div><div className="mt-4 border-t border-black/5 pt-4"><div className="flex justify-between text-sm"><span className="text-muted">Total</span><strong>{money(selected.total)}</strong></div><p className="mt-3 text-xs text-muted">Current status: {ORDER_STATUS_LABELS[selected.status]}</p><Button className="mt-4 w-full" disabled={selected.status==="DELIVERED"} onClick={()=>advanceOrder(selected.id)}>Advance status</Button></div></> : <div className="py-8 text-center"><ClipboardList className="mx-auto text-muted"/><p className="mt-3 text-sm font-semibold">Select an order</p><p className="mt-1 text-xs text-muted">View line items and advance its simulated status.</p></div>}</aside></div>
  </div>;
}

function ReviewModeration() {
  const reviews = useReviewStore((state)=>state.reviews);
  const setReviewStatus = useReviewStore((state)=>state.setReviewStatus);
  const [filter,setFilter]=useState("all");
  const visible=reviews.filter((review)=>filter==="all"||review.status===filter);
  return <div className="space-y-5"><LocalNotice>Review visibility changes are local moderation actions. They do not publish to a shared production service.</LocalNotice><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Review moderation</h2><p className="mt-1 text-sm text-muted">Hide reviews from product pages or restore them.</p></div><select aria-label="Filter reviews by visibility" value={filter} onChange={(event)=>setFilter(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"><option value="all">All reviews</option><option value="PUBLISHED">Published</option><option value="HIDDEN">Hidden</option></select></div>
    <div className="space-y-3">{visible.map((review)=><article key={review.id} className="rounded-2xl bg-white p-5 shadow-soft"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{review.title}</p><p className="mt-1 text-xs text-muted">Product #{review.productId} · {review.reviewerName} · {review.rating}/5 · {new Date(review.createdAt).toLocaleDateString()}</p></div><span className={review.status==="PUBLISHED"?"rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700":"rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"}>{review.status}</span></div><p className="mt-3 text-sm leading-6 text-muted">{review.body}</p><div className="mt-4 flex justify-end"><Button variant="secondary" onClick={()=>setReviewStatus(review.id,review.status==="PUBLISHED"?"HIDDEN":"PUBLISHED")}>{review.status==="PUBLISHED"?<><EyeOff size={13}/> Hide review</>:<><Eye size={13}/> Restore review</>}</Button></div></article>)}{visible.length===0&&<div className="rounded-2xl bg-white p-8 text-center text-sm text-muted">No reviews in this view.</div>}</div>
  </div>;
}

function RecommendationAnalytics() {
  const impressions=useRecommendationAnalyticsStore((state)=>state.impressions);
  const clicks=useRecommendationAnalyticsStore((state)=>state.clicks);
  const adds=useRecommendationAnalyticsStore((state)=>state.addToCartFromRecommendation);
  const total=(record:Record<string,number>)=>Object.values(record).reduce((sum,value)=>sum+value,0);
  const impressionCount=total(impressions),clickCount=total(clicks),addCount=total(adds);
  const conversion=clickCount?addCount/clickCount*100:0;
  const strategies=Array.from(new Set([...Object.keys(impressions),...Object.keys(clicks),...Object.keys(adds)].map((key)=>key.split(":")[0])));
  const breakdown=strategies.map((strategy)=>({strategy,impressions:total(Object.fromEntries(Object.entries(impressions).filter(([key])=>key.startsWith(strategy+":")))),clicks:total(Object.fromEntries(Object.entries(clicks).filter(([key])=>key.startsWith(strategy+":")))),adds:total(Object.fromEntries(Object.entries(adds).filter(([key])=>key.startsWith(strategy+":"))))})).sort((a,b)=>b.clicks-a.clicks);
  return <div className="space-y-5"><LocalNotice>All figures are collected from this browser's local recommendation event store. They are not external analytics or real business sales.</LocalNotice><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">Local Analytics</p><h2 className="mt-2 text-xl font-bold">Recommendation analytics</h2><p className="mt-1 text-sm text-muted">Engagement across the nine recommendation strategies.</p></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Recommendation impressions" value={impressionCount.toLocaleString()} detail="Local rail/card render events" icon={Eye}/><StatCard label="Recommendation clicks" value={clickCount.toLocaleString()} detail="Local product click events" icon={ArrowUpRight}/><StatCard label="Simulated add-to-cart conversion" value={conversion.toFixed(1)+"%"} detail={`${addCount} add-to-cart events from ${clickCount} clicks`} icon={ShoppingBag}/></div><div className="overflow-x-auto rounded-2xl bg-white shadow-soft"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-canvas text-xs text-muted"><tr><th className="p-4">Strategy</th><th className="p-4">Impressions</th><th className="p-4">Clicks</th><th className="p-4">Add to cart</th><th className="p-4">Click rate</th></tr></thead><tbody>{breakdown.map((item)=><tr key={item.strategy} className="border-t border-black/5"><td className="p-4 font-semibold capitalize">{item.strategy.replace(/-/g," ")}</td><td className="p-4">{item.impressions}</td><td className="p-4">{item.clicks}</td><td className="p-4">{item.adds}</td><td className="p-4">{item.impressions?(item.clicks/item.impressions*100).toFixed(1)+"%":"—"}</td></tr>)}{breakdown.length===0&&<tr><td colSpan={5} className="p-8 text-center text-sm text-muted">No recommendation events have been recorded in this browser yet.</td></tr>}</tbody></table></div><p className="text-[11px] text-muted">Popular recommendation types are ranked by locally recorded clicks. Impressions are counted per rendered product card and may repeat across visits.</p></div>;
}

export function AdminDashboard() {
  const hasCatalogHydrated=useAdminCatalogStore((state)=>state.hasHydrated);
  const {data:productResponse,isPending:productsPending,isError:productsError,refetch}=useQuery({queryKey:productKeys.catalogue,queryFn:({signal})=>productService.getAll(signal),enabled:hasCatalogHydrated});
  const {data:categories=[]}=useQuery({queryKey:productKeys.categories,queryFn:({signal})=>productService.getCategories(signal),enabled:hasCatalogHydrated});
  const orders=useCheckoutStore((state)=>state.orders);
  const users=useAuthStore((state)=>state.users);
  const reviews=useReviewStore((state)=>state.reviews);
  const [tab,setTab]=useState<Tab>("overview");
  const products=productResponse?.products??[];
  const revenue=orders.reduce((sum,order)=>sum+order.total,0);
  const topProducts=[...products].sort((a,b)=>b.rating-a.rating).slice(0,5);
  const lowStock=products.filter((product)=>product.stock<=5).sort((a,b)=>a.stock-b.stock).slice(0,6);
  const customerCount=users.filter((user)=>user.role==="CUSTOMER").length;
  const visibleReviews=reviews.filter((review)=>review.status==="PUBLISHED").length;
  const convertedCustomers=new Set(orders.map((order)=>order.customer.email.toLowerCase())).size;
  const simulatedConversion=customerCount?Math.min(100,convertedCustomers/customerCount*100):0;

  return <main className="min-h-screen bg-[#f5f6f2] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="text-sm font-black">shop<span className="text-brand">sphere</span><span className="ml-1 text-[10px] text-brand">AI</span></Link><div className="mt-5 flex items-center gap-2 text-brand"><ShieldCheck size={20}/><span className="text-xs font-bold uppercase tracking-[.18em]">Administrator workspace</span></div><h1 className="mt-2 text-3xl font-bold tracking-tight">Operations dashboard</h1><p className="mt-1 text-sm text-muted">Catalogue health, order flow, customer feedback, and recommendation engagement.</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-muted">Frontend demo</span><Link href="/"><Button variant="secondary" >Back to storefront</Button></Link></div></header>
    <LocalNotice>All admin write actions and operational figures are local simulations. This role gate is a frontend demonstration, not a production security boundary.</LocalNotice>
    <div className="mt-6 grid gap-2 rounded-2xl bg-white p-2 shadow-soft sm:grid-cols-2 lg:grid-cols-5" role="tablist" aria-label="Admin sections">{tabItems.map(({id,label,icon:Icon})=><button key={id} type="button" role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold transition ${tab===id?"bg-brand text-white":"text-muted hover:bg-canvas hover:text-ink"}`}><Icon size={15}/>{label}</button>)}</div>
    <div className="mt-6">
      {tab==="overview"&&<div className="space-y-7"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total products" value={productsPending?"…":products.length.toLocaleString()} detail="Current mock/local catalogue" icon={Boxes}/><StatCard label="Total orders" value={orders.length.toLocaleString()} detail="Browser-local order history" icon={ShoppingBag}/><StatCard label="Total customers" value={customerCount.toLocaleString()} detail="Local demo and registered accounts" icon={Users}/><StatCard label="Simulated revenue" value={money(revenue)} detail="Sum of locally recorded orders" icon={CircleDollarSign}/></div><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><div><h2 className="font-bold">Top-performing products</h2><p className="mt-1 text-xs text-muted">Ranked by catalogue rating.</p></div><Star className="text-accent" size={18}/></div><div className="mt-4 space-y-3">{topProducts.map((product,index)=><div key={product.id} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-lg bg-canvas text-xs font-bold">{index+1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.title}</p><p className="text-xs text-muted">Product #{product.id}</p></div><span className="flex items-center gap-1 text-sm font-semibold"><Star size={13} className="fill-accent text-accent"/>{product.rating.toFixed(1)}</span></div>)}{!topProducts.length&&<p className="text-sm text-muted">No catalogue products available.</p>}</div></section><section className="rounded-2xl bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><div><h2 className="font-bold">Low-stock alerts</h2><p className="mt-1 text-xs text-muted">Products with five or fewer units.</p></div><AlertTriangle className="text-amber-600" size={18}/></div><div className="mt-4 space-y-3">{lowStock.map((product)=><div key={product.id} className="flex items-center justify-between gap-3 border-b border-black/5 pb-3 last:border-0"><p className="min-w-0 truncate text-sm font-semibold">{product.title}</p><span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{product.stock} left</span></div>)}{!lowStock.length&&<p className="text-sm text-muted">No low-stock products in the current catalogue.</p>}</div></section></div><div className="grid gap-4 sm:grid-cols-2"><StatCard label="Simulated conversion rate" value={simulatedConversion.toFixed(1)+"%"} detail="Local orders divided by local customer accounts" icon={ArrowUpRight}/><StatCard label="Published reviews" value={visibleReviews.toLocaleString()} detail={`${reviews.length-visibleReviews} hidden by local moderation`} icon={MessageSquare}/></div><Button onClick={()=>setTab("analytics")} variant="secondary">View recommendation analytics <ChevronRight size={15}/></Button></div>}
      {tab==="products"&&(productsPending||!hasCatalogHydrated?<p role="status" className="rounded-2xl bg-white p-8 text-sm text-muted">Loading catalogue…</p>:productsError?<div role="alert" className="rounded-2xl bg-white p-8 text-sm"><p>We couldn’t load the catalogue.</p><Button className="mt-3" onClick={()=>void refetch()}>Retry</Button></div>:<ProductManagement products={products} categories={categories}/>)}
      {tab==="orders"&&<OrderManagement orders={orders}/>}
      {tab==="reviews"&&<ReviewModeration/>}
      {tab==="analytics"&&<RecommendationAnalytics/>}
    </div>
    <footer className="mt-10 border-t border-black/5 pt-5 text-xs text-muted">ShopSphere AI · Administrator workspace · Local simulation only</footer>
  </div></main>;
}
