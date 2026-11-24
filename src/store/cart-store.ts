"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product, ProductVariant } from "@/types/product";

export interface CartLine {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}
interface CartState {
  items: CartLine[];
  savedItems: CartLine[];
  couponCode: string | null;
  hasHydrated: boolean;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: number, variantId?: string) => void;
  setQuantity: (productId: number, quantity: number, variantId?: string) => void;
  moveToSaved: (productId: number, variantId?: string) => void;
  moveSavedToCart: (productId: number, variantId?: string) => void;
  removeSavedItem: (productId: number, variantId?: string) => void;
  updateProductSnapshot: (product: Product, variant?: ProductVariant) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;
}
const stockFor = (product: Product, variant?: ProductVariant) => Math.max(0, variant?.stock ?? product.stock);
const sameLine = (line: CartLine, productId: number, variantId?: string) =>
  line.product.id === productId && line.variant?.id === variantId;

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  savedItems: [],
  couponCode: null,
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),
  addItem: (product, variant, requestedQuantity = 1) => set((state) => {
    const max = stockFor(product, variant);
    if (max < 1) return state;
    const amount = Math.min(Math.max(1, Math.floor(requestedQuantity) || 1), max);
    const existing = state.items.find((line) => sameLine(line, product.id, variant?.id));
    if (existing) return { items: state.items.map((line) =>
      sameLine(line, product.id, variant?.id)
        ? { ...line, product, variant, quantity: Math.min(line.quantity + amount, max) }
        : line) };
    return { items: [...state.items, { product, quantity: amount, ...(variant ? { variant } : {}) }] };
  }),
  removeItem: (productId, variantId) => set((state) => ({
    items: state.items.filter((line) => !sameLine(line, productId, variantId)),
  })),
  setQuantity: (productId, quantity, variantId) => set((state) => ({
    items: state.items.map((line) => {
      if (!sameLine(line, productId, variantId)) return line;
      const max = stockFor(line.product, line.variant);
      return { ...line, quantity: max < 1 ? 0 : Math.min(Math.max(1, Math.floor(quantity) || 1), max) };
    }).filter((line) => line.quantity > 0),
  })),
  moveToSaved: (productId, variantId) => set((state) => {
    const line = state.items.find((item) => sameLine(item, productId, variantId));
    if (!line) return state;
    return {
      items: state.items.filter((item) => !sameLine(item, productId, variantId)),
      savedItems: state.savedItems.some((item) => sameLine(item, productId, variantId))
        ? state.savedItems
        : [...state.savedItems, line],
    };
  }),
  moveSavedToCart: (productId, variantId) => set((state) => {
    const line = state.savedItems.find((item) => sameLine(item, productId, variantId));
    if (!line) return state;
    const max = stockFor(line.product, line.variant);
    if (max < 1) return state;
    const existing = state.items.find((item) => sameLine(item, productId, variantId));
    return {
      savedItems: state.savedItems.filter((item) => !sameLine(item, productId, variantId)),
      items: existing
        ? state.items.map((item) => sameLine(item, productId, variantId)
          ? { ...item, quantity: Math.min(item.quantity + line.quantity, max) } : item)
        : [...state.items, { ...line, quantity: Math.min(line.quantity, max) }],
    };
  }),
  removeSavedItem: (productId, variantId) => set((state) => ({
    savedItems: state.savedItems.filter((line) => !sameLine(line, productId, variantId)),
  })),
  updateProductSnapshot: (product, variant) => set((state) => ({
    items: state.items.map((line) => line.product.id === product.id && line.variant?.id === variant?.id
      ? { ...line, product, ...(variant ? { variant } : { variant: undefined }) } : line),
    savedItems: state.savedItems.map((line) => line.product.id === product.id && line.variant?.id === variant?.id
      ? { ...line, product, ...(variant ? { variant } : { variant: undefined }) } : line),
  })),
  setCouponCode: (code) => set({ couponCode: code }),
  clearCart: () => set({ items: [], couponCode: null }),
}), {
  name: "shopsphere-cart",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ items: state.items, savedItems: state.savedItems, couponCode: state.couponCode }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));
