import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface CartLine { product: Product; quantity: number; }
interface CartState { items: CartLine[]; addItem: (product: Product) => void; removeItem: (productId: number) => void; }
export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  addItem: (product) => set((state) => {
    const existing = state.items.find((line) => line.product.id === product.id);
    if (existing) return { items: state.items.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line) };
    return { items: [...state.items, { product, quantity: 1 }] };
  }),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((line) => line.product.id !== productId) })),
}), { name: "shopsphere-cart", storage: createJSONStorage(() => localStorage) }));
