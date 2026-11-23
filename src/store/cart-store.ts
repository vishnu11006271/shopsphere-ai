"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, ProductVariant } from "@/types/product";

export interface CartLine { product: Product; quantity: number; variant?: ProductVariant; }
interface CartState {
  items: CartLine[];
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: number, variantId?: string) => void;
}
const stockFor = (product: Product, variant?: ProductVariant) => variant?.stock ?? product.stock;
export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  addItem: (product, variant, requestedQuantity = 1) => set((state) => {
    const existing = state.items.find((line) => line.product.id === product.id && line.variant?.id === variant?.id);
    const max = stockFor(product, variant);
    if (max < 1) return state;
    if (existing) return { items: state.items.map((line) =>
      line.product.id === product.id && line.variant?.id === variant?.id
        ? { ...line, quantity: Math.min(line.quantity + Math.max(1, Math.floor(requestedQuantity)), max) } : line) };
    return { items: [...state.items, { product, quantity: Math.min(Math.max(1, Math.floor(requestedQuantity)), max), ...(variant ? { variant } : {}) }] };
  }),
  removeItem: (productId, variantId) => set((state) => ({
    items: state.items.filter((line) => !(line.product.id === productId && line.variant?.id === variantId)),
  })),
}), { name: "shopsphere-cart", storage: createJSONStorage(() => localStorage) }));
