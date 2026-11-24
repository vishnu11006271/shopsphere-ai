"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { productKeys, productService } from "@/features/products/services/product-service";
import { filterAndSortProducts, DEFAULT_FILTERS, getProductFilterChips, type ProductFilters } from "@/features/products/utils/filter-products";
import { ProductFiltersPanel } from "@/features/products/components/product-filters";
import { DiscoveryProductCard } from "@/features/products/components/discovery-product-card";
import { ProductQuickView } from "@/features/products/components/product-quick-view";
import { ProductComparison } from "@/features/products/components/product-comparison";
import { SearchBar } from "@/features/search/components/search-bar";
import { CommerceLinks } from "@/features/cart/components/commerce-links";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import type { Product } from "@/types/product";
import { RecommendationRail } from "@/features/recommendations/components/recommendation-rail";

const PAGE_SIZE=12;
function readFilters(params:URLSearchParams):ProductFilters {
 const minRaw=Number(params.get("minPrice")??0);
 const maxRaw=Number(params.get("maxPrice")??Number.POSITIVE_INFINITY);
 const ratingRaw=Number(params.get("rating")??0);
 const stockRaw=params.get("stock")??"all";
 const sortRaw=params.get("sort")??"relevance";
 const minPrice=Number.isFinite(minRaw)?Math.max(0,minRaw):0;
 const maxPrice=Number.isFinite(maxRaw)?Math.max(minPrice,maxRaw):Number.POSITIVE_INFINITY;
 const minRating=[0,3,4,4.5].includes(ratingRaw)?ratingRaw:0;
 const availability=["all","in-stock","out-of-stock"].includes(stockRaw)?stockRaw as ProductFilters["availability"]:"all";
 const sort=["relevance","price-asc","price-desc","rating","newest"].includes(sortRaw)?sortRaw as ProductFilters["sort"]:"relevance";
 return {minPrice,maxPrice,minRating,availability,onSaleOnly:params.get("sale")==="1",brands:params.getAll("brand"),categories:params.getAll("category"),sort};
}
function DiscoveryContent({categorySlug=""}:{categorySlug?:string}) {
 const router=useRouter();const pathname=usePathname();const searchParams=useSearchParams();const paramsString=searchParams.toString();
 const query=searchParams.get("q")??"";const requestedPage=Number(searchParams.get("page")??1);const currentPage=Number.isFinite(requestedPage)?Math.max(1,requestedPage):1;
 const [filters,setFilters]=useState<ProductFilters>(()=>readFilters(new URLSearchParams(paramsString)));
 const [quickView,setQuickView]=useState<Product|null>(null);const [comparison,setComparison]=useState<Product[]>([]);const [compareMessage,setCompareMessage]=useState("");const [mobileFiltersOpen,setMobileFiltersOpen]=useState(false);
 const categoryQuery=useQuery({queryKey:productKeys.categories,queryFn:({signal})=>productService.getCategories(signal),staleTime:600000});
 const productsQuery=useQuery({queryKey:productKeys.discovery(query,categorySlug),queryFn:({signal})=>productService.discover(query,categorySlug,signal),staleTime:120000});
 const products=productsQuery.data?.products??[];
 const cartCount=useCartStore(state=>state.items.reduce((sum,item)=>sum+item.quantity,0));
 const wishlistCount=useWishlistStore(state=>state.productIds.length);
 const filtered=useMemo(()=>filterAndSortProducts(products,filters),[products,filters]);
 const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));const safePage=Math.min(currentPage,pageCount);
 const pageProducts=filtered.slice((safePage-1)*PAGE_SIZE,safePage*PAGE_SIZE);const chips=getProductFilterChips(filters);
 const categoryName=categoryQuery.data?.find(c=>c.slug===categorySlug)?.name??categorySlug.replaceAll("-"," ");
 const title=query?("Results for “"+query+"”"):categorySlug?categoryName:"Explore all products";
 useEffect(()=>{setFilters(readFilters(new URLSearchParams(paramsString)));},[paramsString]);
 useEffect(()=>{
  const params=new URLSearchParams();if(query)params.set("q",query);
  if(filters.minPrice>0)params.set("minPrice",String(filters.minPrice));if(Number.isFinite(filters.maxPrice))params.set("maxPrice",String(filters.maxPrice));
  if(filters.minRating>0)params.set("rating",String(filters.minRating));if(filters.availability!=="all")params.set("stock",filters.availability);
  if(filters.onSaleOnly)params.set("sale","1");filters.brands.forEach(v=>params.append("brand",v));filters.categories.forEach(v=>params.append("category",v));
  if(filters.sort!=="relevance")params.set("sort",filters.sort);if(currentPage>1)params.set("page",String(currentPage));
  const next=params.toString();if(next!==paramsString)router.replace(next?pathname+"?"+next:pathname,{scroll:false});
 },[filters,query,currentPage,paramsString,router,pathname]);
 function changeFilters(next:ProductFilters){setFilters(next);if(currentPage!==1){const params=new URLSearchParams(paramsString);params.delete("page");router.replace(params.size?pathname+"?"+params:pathname,{scroll:false});}}
 function clearFilters(){setFilters(DEFAULT_FILTERS);router.replace(query?pathname+"?q="+encodeURIComponent(query):pathname,{scroll:false});}
 function goPage(page:number){const params=new URLSearchParams(paramsString);if(page<=1)params.delete("page");else params.set("page",String(page));router.push(params.size?pathname+"?"+params:pathname,{scroll:false});}
 function toggleCompare(product:Product){setCompareMessage("");setComparison(old=>{if(old.some(p=>p.id===product.id))return old.filter(p=>p.id!==product.id);if(old.length>=4){setCompareMessage("You can compare up to four products at a time.");return old;}return [...old,product];});}
 return <main className="min-h-screen">
  <header className="border-b border-black/5 bg-white/80"><div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 lg:px-8"><Link href="/" className="shrink-0 text-xl font-black">shop<span className="text-brand">sphere</span><span className="ml-1 align-top text-[10px] text-brand">AI</span></Link><div className="hidden flex-1 md:block"><SearchBar initialQuery={query} compact/></div><div className="ml-auto flex items-center gap-3"><Link href="/account" className="text-sm font-semibold text-muted hover:text-brand">Account</Link><CommerceLinks cartCount={cartCount} wishlistCount={wishlistCount}/></div></div><div className="mx-auto max-w-7xl px-5 pb-3 lg:px-8"><div className="flex gap-2 overflow-x-auto">{(categoryQuery.data??[]).map(c=><Link key={c.slug} href={"/category/"+c.slug} className={c.slug===categorySlug?"whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-xs text-white":"whitespace-nowrap rounded-full bg-canvas px-3 py-1.5 text-xs text-muted hover:text-brand"}>{c.name}</Link>)}</div></div></header>
  <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
   <div className="mb-6 md:hidden"><SearchBar initialQuery={query} compact/></div><Link href="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-brand"><ArrowLeft size={14}/> Back to home</Link>
   <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">{query?"Search":"Product discovery"}</p><h1 className="mt-2 text-3xl font-semibold capitalize tracking-tight">{title}</h1><p className="mt-2 text-sm text-muted">{productsQuery.isSuccess?filtered.length+" products found":"Explore the collection and find your next favourite."}</p></div><div className="flex items-center gap-2"><button type="button" onClick={()=>setMobileFiltersOpen(v=>!v)} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold lg:hidden"><SlidersHorizontal size={16}/> Filters</button><label className="flex items-center gap-2 text-xs text-muted">Sort by<select aria-label="Sort products" value={filters.sort} onChange={e=>changeFilters({...filters,sort:e.target.value as ProductFilters["sort"]})} className="rounded-full border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-ink"><option value="relevance">Relevance</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option><option value="newest">Newest (catalogue ID)</option></select></label></div></div>
   <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><div className={mobileFiltersOpen?"block":"hidden lg:block"}><ProductFiltersPanel products={products} filters={filters} onChange={changeFilters} onClear={clearFilters}/></div>
    <section aria-label="Product results">
     {chips.length>0&&<div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">Active filters:</span>{chips.map((chip,i)=><span key={i} className="rounded-full bg-[#e8eee7] px-3 py-1.5 text-xs text-brand">{chip}</span>)}<button type="button" onClick={clearFilters} className="text-xs font-semibold text-brand underline">Clear filters</button></div>}
     {productsQuery.isPending?<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-72 animate-pulse rounded-3xl bg-white"/>)}</div>
      :productsQuery.isError?<div role="alert" className="rounded-3xl bg-white p-10 text-center"><h2 className="text-lg font-semibold">We couldn’t load these products.</h2><p className="mt-2 text-sm text-muted">The catalogue service may be temporarily unavailable.</p><button type="button" onClick={()=>void productsQuery.refetch()} className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Try again</button></div>
      :pageProducts.length===0?<div className="rounded-3xl bg-white p-10 text-center"><h2 className="text-lg font-semibold">No products match these filters.</h2><p className="mt-2 text-sm text-muted">{chips.length?"Try removing "+chips.slice(0,2).join(" or ")+" to see more results.":"Try a different search term or browse another category."}</p><button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Clear filters</button>{query&&<p className="mt-4 text-xs text-muted">Try a broader search such as “electronics”, “beauty”, or “shoes”.</p>}</div>
      :<><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{pageProducts.map(product=><DiscoveryProductCard key={product.id} product={product} onQuickView={setQuickView} onCompare={toggleCompare} comparing={comparison.some(p=>p.id===product.id)}/>)}</div>
       <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">Showing {(safePage-1)*PAGE_SIZE+1}–{Math.min(safePage*PAGE_SIZE,filtered.length)} of {filtered.length}</p><div className="flex items-center gap-2"><button type="button" disabled={safePage<=1} onClick={()=>goPage(safePage-1)} className="rounded-full border border-black/10 bg-white p-2.5 disabled:opacity-40"><ArrowLeft size={16}/></button><span className="px-2 text-sm">{safePage} / {pageCount}</span><button type="button" disabled={safePage>=pageCount} onClick={()=>goPage(safePage+1)} className="rounded-full border border-black/10 bg-white p-2.5 disabled:opacity-40"><ArrowRight size={16}/></button></div></div></>}
     {compareMessage&&<p role="status" className="mt-3 text-right text-xs text-rose-600">{compareMessage}</p>}
    </section>
   </div>
  </div>
  <div className="mx-auto max-w-7xl px-5 pb-14 lg:px-8"><RecommendationRail strategy="category-based" title={"More in " + categoryName} category={categorySlug} note="Based on the category you are browsing." enabled={Boolean(categorySlug)}/>
      <RecommendationRail strategy="price-based" title="Within Your Price Range" note="Based on the typical price of products you have viewed, saved or added to your cart." enabled={Boolean(query)}/></div>
  <ProductQuickView product={quickView} onClose={()=>setQuickView(null)}/>
  <ProductComparison products={comparison} onRemove={id=>setComparison(old=>old.filter(p=>p.id!==id))} onClear={()=>setComparison([])}/>
 </main>;
}
export function DiscoveryPage({categorySlug=""}:{categorySlug?:string}) {
 return <Suspense fallback={<main className="mx-auto max-w-7xl animate-pulse px-5 py-12"><div className="h-8 w-1/3 rounded bg-white"/><div className="mt-8 h-96 rounded-3xl bg-white"/></main>}><DiscoveryContent categorySlug={categorySlug}/></Suspense>;
}
