"use client";
import Image from "next/image";
import { useEffect } from "react";
import { X, Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/product";
export function ProductQuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  useEffect(() => {
    if (!product) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [product, onClose]);
  if (!product) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="relative grid max-h-[90vh] w-full max-w-3xl gap-6 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:grid-cols-2 sm:p-8"
      >
        <button
          type="button"
          aria-label="Close quick view"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-canvas p-2"
        >
          <X size={18} />
        </button>
        <div className="relative min-h-64 overflow-hidden rounded-2xl bg-canvas">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width:640px) 90vw,40vw"
            className="object-contain p-8"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            {product.category}
          </p>
          <h2 id="quick-view-title" className="mt-3 pr-8 text-2xl font-semibold">
            {product.title}
          </h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <Star size={15} className="fill-accent text-accent" />
            {product.rating.toFixed(1)} ·{" "}
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="mt-5 text-2xl font-bold">{formatINR(product.price * 85)}</p>
          <p className="mt-4 text-sm leading-6 text-muted">{product.description}</p>
          <button
            type="button"
            disabled={product.stock < 1}
            onClick={() => {
              addItem(product);
              onClose();
            }}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            <ShoppingBag size={16} /> Add to cart
          </button>
        </div>
      </section>
    </div>
  );
}
