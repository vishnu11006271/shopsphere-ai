"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product, ProductCategory } from "@/types/product";

interface AdminCatalogState {
  products: Product[];
  deletedProductIds: number[];
  categories: ProductCategory[];
  deletedCategorySlugs: string[];
  hasHydrated: boolean;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  addCategory: (category: ProductCategory) => void;
  renameCategory: (slug: string, name: string) => void;
  deleteCategory: (slug: string) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAdminCatalogStore = create<AdminCatalogState>()(persist((set) => ({
  products: [],
  deletedProductIds: [],
  categories: [],
  deletedCategorySlugs: [],
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),
  saveProduct: (product) => set((state) => ({
    products: [...state.products.filter((item) => item.id !== product.id), product],
    deletedProductIds: state.deletedProductIds.filter((id) => id !== product.id),
  })),
  deleteProduct: (productId) => set((state) => ({
    products: state.products.filter((item) => item.id !== productId),
    deletedProductIds: state.deletedProductIds.includes(productId) ? state.deletedProductIds : [...state.deletedProductIds, productId],
  })),
  addCategory: (category) => set((state) => ({
    categories: [...state.categories.filter((item) => item.slug !== category.slug), category],
    deletedCategorySlugs: state.deletedCategorySlugs.filter((slug) => slug !== category.slug),
  })),
  renameCategory: (slug, name) => set((state) => ({
    categories: [...state.categories.filter((item) => item.slug !== slug), { slug, name, url: "" }],
  })),
  deleteCategory: (slug) => set((state) => ({
    categories: state.categories.filter((item) => item.slug !== slug),
    deletedCategorySlugs: state.deletedCategorySlugs.includes(slug) ? state.deletedCategorySlugs : [...state.deletedCategorySlugs, slug],
  })),
}), {
  name: "shopsphere-admin-catalog",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ products: state.products, deletedProductIds: state.deletedProductIds, categories: state.categories, deletedCategorySlugs: state.deletedCategorySlugs }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));

export function mergeAdminProducts(baseProducts: Product[]): Product[] {
  const state = useAdminCatalogStore.getState();
  const baseIds = new Set(baseProducts.map((product) => product.id));
  const localById = new Map(state.products.map((product) => [product.id, product]));
  const merged = baseProducts
    .filter((product) => !state.deletedProductIds.includes(product.id))
    .map((product) => localById.get(product.id) ?? product);
  state.products.filter((product) => !baseIds.has(product.id) && !state.deletedProductIds.includes(product.id)).forEach((product) => merged.push(product));
  return merged;
}

export function mergeAdminCategories(baseCategories: ProductCategory[]): ProductCategory[] {
  const state = useAdminCatalogStore.getState();
  const merged = new Map(baseCategories.map((category) => [category.slug, category]));
  state.categories.forEach((category) => merged.set(category.slug, category));
  state.deletedCategorySlugs.forEach((slug) => merged.delete(slug));
  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function waitForAdminCatalogHydration(): Promise<void> {
  if (useAdminCatalogStore.getState().hasHydrated) return;
  await new Promise<void>((resolve) => {
    const unsubscribe = useAdminCatalogStore.subscribe((state) => {
      if (state.hasHydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
}
