"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Search, TrendingUp, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productKeys, productService } from "@/features/products/services/product-service";
import { useSearchHistoryStore } from "@/features/search/store/search-history-store";
const POPULAR_SEARCHES = ["wireless headphones","skincare","laptops","sneakers"];
export function SearchBar({initialQuery="",compact=false}:{initialQuery?:string;compact?:boolean}) {
 const router=useRouter(); const [value,setValue]=useState(initialQuery); const [debounced,setDebounced]=useState(initialQuery); const [focused,setFocused]=useState(false); const wrapper=useRef<HTMLDivElement>(null);
 const searches=useSearchHistoryStore(s=>s.searches); const addSearch=useSearchHistoryStore(s=>s.add); const clearSearches=useSearchHistoryStore(s=>s.clear);
 useEffect(()=>{const timer=window.setTimeout(()=>setDebounced(value.trim()),350);return()=>window.clearTimeout(timer);},[value]);
 const {data}=useQuery({queryKey:productKeys.discovery(debounced,""),queryFn:({signal})=>productService.discover(debounced,"",signal),enabled:debounced.length>=2&&focused,staleTime:60_000});
 const suggestions=useMemo(()=>(data?.products??[]).slice(0,5),[data]);
 const categoriesQuery=useQuery({queryKey:productKeys.categories,queryFn:({signal})=>productService.getCategories(signal),enabled:focused&&debounced.length>=2,staleTime:600000});
 const categorySuggestions=useMemo(()=>(categoriesQuery.data??[]).filter(c=>(c.name+" "+c.slug).toLowerCase().includes(debounced.toLowerCase())).slice(0,3),[categoriesQuery.data,debounced]);
 useEffect(()=>{function onPointerDown(event:PointerEvent){if(wrapper.current&&!wrapper.current.contains(event.target as Node))setFocused(false);}document.addEventListener("pointerdown",onPointerDown);return()=>document.removeEventListener("pointerdown",onPointerDown);},[]);
 function submit(query=value){const clean=query.trim();if(!clean)return;addSearch(clean);setFocused(false);router.push(`/search?q=${encodeURIComponent(clean)}`);}
 function onSubmit(event:FormEvent<HTMLFormElement>){event.preventDefault();submit();}
 return <div ref={wrapper} className="relative w-full">
  <form onSubmit={onSubmit} role="search" className={`flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 ${compact?"py-2":"py-3"} focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10`}>
   <Search size={18} className="shrink-0 text-muted"/><input aria-label="Search products" value={value} onChange={e=>setValue(e.target.value)} onFocus={()=>setFocused(true)} placeholder="Search products, brands, categories…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" autoComplete="off"/>
   {value&&<button type="button" aria-label="Clear search" onClick={()=>setValue("")} className="rounded-full p-1 text-muted hover:bg-canvas"><X size={15}/></button>}
   <button type="submit" className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand/90">Search</button>
  </form>
  {focused&&<div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-soft">
   {debounced.length>=2?<div><p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted">Matching products</p>
    {suggestions.length?suggestions.map(product=><button key={product.id} type="button" onClick={()=>submit(product.title)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-canvas"><img src={product.thumbnail} alt="" className="h-10 w-10 rounded-lg bg-canvas object-contain p-1"/><span className="min-w-0 flex-1 truncate text-sm font-medium">{product.title}</span><span className="text-xs text-muted">₹{Math.round(product.price*85).toLocaleString("en-IN")}</span></button>):<p className="px-3 py-4 text-sm text-muted">No matching products yet.</p>}
    {categorySuggestions.length>0&&<div className="mt-2 border-t border-black/5 pt-2"><p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted">Matching categories</p>{categorySuggestions.map(category=><button key={category.slug} type="button" onClick={()=>{setFocused(false);router.push("/category/"+category.slug);}} className="block w-full rounded-xl px-3 py-2 text-left text-sm capitalize hover:bg-canvas">{category.name} <span className="text-xs text-muted">category</span></button>)}</div>}
    <button type="button" onClick={()=>submit()} className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-brand hover:bg-canvas">See all results for “{debounced}”</button>
   </div>:<div><div className="flex items-center justify-between px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-widest text-muted">{searches.length?"Recent searches":"Popular searches"}</p>{searches.length>0&&<button type="button" onClick={clearSearches} className="text-xs text-muted hover:text-brand">Clear history</button>}</div>
    {(searches.length?searches:POPULAR_SEARCHES).map(term=><button key={term} type="button" onClick={()=>submit(term)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-canvas"><span className="text-muted">{searches.length?<Clock3 size={15}/>:<TrendingUp size={15}/>}</span>{term}</button>)}
   </div>}
  </div>}
 </div>;
}
