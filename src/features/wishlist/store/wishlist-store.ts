"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "@/types/product";

interface WishlistState {
  productIds: number[];
  productSnapshots: Product[];
  hasHydrated: boolean;
  toggle: (productId: number, product?: Product) => void;
  remove: (productId: number) => void;
  saveProduct: (product: Product) => void;
  setHasHydrated: (value: boolean) => void;
}
export const useWishlistStore = create<WishlistState>()(persist((set) => ({
  productIds: [],
  productSnapshots: [],
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),
  toggle: (productId, product) => set((state) => {
    const exists = state.productIds.includes(productId);
    return {
      productIds: exists ? state.productIds.filter((id) => id !== productId) : [...state.productIds, productId],
      productSnapshots: exists
        ? state.productSnapshots.filter((item) => item.id !== productId)
        : product ? [...state.productSnapshots.filter((item) => item.id !== productId), product] : state.productSnapshots,
    };
  }),
  remove: (productId) => set((state) => ({
    productIds: state.productIds.filter((id) => id !== productId),
    productSnapshots: state.productSnapshots.filter((item) => item.id !== productId),
  })),
  saveProduct: (product) => set((state) => ({
    productSnapshots: state.productIds.includes(product.id)
      ? [...state.productSnapshots.filter((item) => item.id !== product.id), product]
      : state.productSnapshots,
  })),
}), {
  name: "shopsphere-wishlist",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ productIds: state.productIds, productSnapshots: state.productSnapshots }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));
