"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface ViewedProduct {
  product: Product;
  viewedAt: string;
}
interface RecentlyViewedState {
  entries: ViewedProduct[];
  hasHydrated: boolean;
  addViewed: (product: Product) => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      entries: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addViewed: (product) =>
        set((state) => ({
          entries: [
            { product, viewedAt: new Date().toISOString() },
            ...state.entries.filter((entry) => entry.product.id !== product.id),
          ],
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "shopsphere-recently-viewed",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
