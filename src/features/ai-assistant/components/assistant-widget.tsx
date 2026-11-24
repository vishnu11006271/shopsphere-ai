"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, LoaderCircle, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productKeys, productService } from "@/features/products/services/product-service";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/utils";
import { respondToShoppingRequest } from "../services/assistant-service";
import type { AssistantConversationContext } from "../types";
import type { Product } from "@/types/product";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  suggestions?: string[];
}

const STARTER_PROMPTS = [
  "Show me headphones under ₹5,000",
  "Find smartphones with good ratings",
  "Show me laptops under ₹60,000",
];

function InlineProduct({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  return <article data-testid="assistant-product-card" className="flex min-w-0 gap-3 rounded-2xl border border-black/5 bg-white p-2.5">
    <Link href={"/products/" + product.id} className="relative size-[76px] shrink-0 overflow-hidden rounded-xl bg-[#f0f1eb]" aria-label={"View " + product.title}>
      <Image src={product.thumbnail} alt="" fill sizes="76px" className="object-contain p-2"/>
    </Link>
    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 text-xs font-semibold leading-5 text-ink">{product.title}</p>
      <p className="mt-1 text-[11px] text-muted">★ {product.rating.toFixed(1)} · {product.stock > 0 ? "In stock" : "Out of stock"}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-bold">{formatINR(product.price * 85)}</span>
        <Button type="button" disabled={product.stock < 1} className="!px-3 !py-1.5 !text-[11px]" onClick={() => addItem(product)}>Add to cart</Button>
      </div>
    </div>
  </article>;
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const context = useRef<AssistantConversationContext>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: productKeys.catalogue,
    queryFn: ({ signal }) => productService.getAll(signal),
    staleTime: 120_000,
    enabled: open,
  });
  const categories = useMemo(() => {
    const names = new Map<string, string>();
    (data?.products ?? []).forEach((product) => names.set(product.category, product.category.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")));
    return Array.from(names, ([slug, name]) => ({ slug, name, url: "" }));
  }, [data?.products]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const submit = async (value: string) => {
    const message = value.trim();
    if (!message || sending || isPending || isError || !data?.products) return;
    setDraft("");
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: message }]);
    setSending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 140));
    try {
      const response = respondToShoppingRequest(message, data.products, categories, context.current);
      if (response.intent) context.current.previousIntent = response.intent;
      if (response.products.length) context.current.previousResults = response.products;
      setMessages((current) => [...current, {
        id: crypto.randomUUID(), role: "assistant", text: response.text,
        products: response.products, suggestions: response.suggestions,
      }]);
    } catch {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(), role: "assistant",
        text: "Something interrupted that search. Please try a category and budget again.",
        suggestions: STARTER_PROMPTS,
      }]);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setMessages([]);
    context.current = {};
    setDraft("");
  };

  return <>
    {open && <section data-testid="assistant-panel" aria-label="ShopSphere shopping assistant" className="fixed bottom-24 right-4 z-50 flex h-[min(760px,calc(100dvh-7rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#f8f9f5] shadow-2xl max-sm:inset-0 max-sm:bottom-0 max-sm:right-0 max-sm:h-[100dvh] max-sm:w-full max-sm:rounded-none">
      <header className="flex items-center justify-between bg-[#173f31] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/10"><Sparkles size={19}/></span>
          <div><h2 className="text-sm font-bold">ShopSphere Assistant</h2><p className="mt-0.5 text-[10px] text-white/70">Rule-based shopping helper · no LLM</p></div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Clear conversation" title="Clear conversation" onClick={reset} className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"><RotateCcw size={16}/></button>
          <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"><X size={19}/></button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
        {!messages.length && <div className="pt-5">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e5eee7] text-brand"><Bot size={27}/></div>
          <h3 className="mt-4 text-center text-xl font-semibold tracking-tight">What are you shopping for?</h3>
          <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-5 text-muted">Describe a category, budget, or rating preference. I’ll search the catalogue and keep your refinements in context.</p>
          <div className="mt-6 space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[.16em] text-muted">Try asking</p>
            {STARTER_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => void submit(prompt)} disabled={isPending || isError} className="block w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-xs font-medium transition hover:border-brand hover:text-brand disabled:opacity-50">{prompt}</button>)}
          </div>
        </div>}

        {isPending && <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-xs text-muted"><LoaderCircle size={16} className="animate-spin"/> Loading the product catalogue…</div>}
        {isError && <div role="alert" className="rounded-2xl bg-white p-4 text-xs text-rose-700"><p>We couldn’t load products for the assistant.</p><button type="button" onClick={() => void refetch()} className="mt-2 font-semibold underline">Try again</button></div>}

        {messages.map((message) => <div key={message.id} data-testid={message.role === "assistant" ? "assistant-message" : "user-message"} className={message.role === "user" ? "ml-8" : "mr-3"}>
          <div className={message.role === "user" ? "ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#173f31] px-4 py-3 text-xs leading-5 text-white" : "rounded-2xl rounded-bl-md bg-white px-4 py-3 text-xs leading-5 text-ink shadow-sm"}>
            {message.role === "assistant" && <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand">ShopSphere</p>}
            {message.text}
          </div>
          {Boolean(message.products?.length) && <div className="mt-2 grid gap-2">{message.products?.map((product) => <InlineProduct key={product.id} product={product}/>)}</div>}
          {Boolean(message.suggestions?.length) && <div className="mt-2 flex flex-wrap gap-2">{message.suggestions?.map((suggestion) => <button key={suggestion} type="button" onClick={() => void submit(suggestion)} disabled={sending || isPending || isError} className="rounded-full border border-brand/20 bg-white px-3 py-2 text-[10px] font-semibold text-brand hover:bg-[#e8f0e9] disabled:opacity-50">{suggestion}</button>)}</div>}
        </div>)}
        {sending && <div className="mr-12 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs text-muted"><LoaderCircle size={15} className="animate-spin"/> Finding relevant products…</div>}
        <div ref={bottomRef}/>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); void submit(draft); }} className="border-t border-black/5 bg-white p-3">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f9f5] p-1.5 pl-4 focus-within:border-brand">
          <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={isPending || isError} aria-label="Describe what you want to shop for" placeholder="e.g. headphones under ₹5,000" className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-muted/70"/>
          <button type="submit" aria-label="Send message" disabled={!draft.trim() || sending || isPending || isError} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#173f31] text-white transition hover:bg-brand disabled:opacity-35"><Send size={16}/></button>
        </div>
        <p className="mt-2 text-center text-[9px] text-muted">Rule-based demo assistant. Product prices use the storefront’s illustrative display conversion.</p>
      </form>
    </section>}

    <button type="button" aria-label={open ? "Close ShopSphere assistant" : "Ask ShopSphere"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#173f31] px-5 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
      {open ? <X size={18}/> : <MessageCircle size={18}/>}
      <span>{open ? "Close" : "Ask ShopSphere"}</span>
    </button>
  </>;
}
