import { apiGet } from "@/services/api/http-client";
import type { Product, ProductCategory, ProductListResponse } from "@/types/product";
import { mergeAdminCategories, mergeAdminProducts, waitForAdminCatalogHydration, useAdminCatalogStore } from "@/features/admin/store/admin-catalog-store";

export const productKeys = {
  all: ["products"] as const,
  featured: ["products", "featured"] as const,
  catalogue: ["products", "catalogue"] as const,
  categories: ["products", "categories"] as const,
  discovery: (query: string, category: string) => ["products", "discovery", query, category] as const,
  detail: (id: number) => ["products", "detail", id] as const,
  related: (category: string, excludeId: number) => ["products", "related", category, excludeId] as const,
};

function response(products: Product[]): ProductListResponse {
  return { products, total: products.length, skip: 0, limit: products.length };
}

async function getMergedCatalogue(signal?: AbortSignal): Promise<Product[]> {
  await waitForAdminCatalogHydration();
  const result = await apiGet<ProductListResponse>("/products?limit=0", signal);
  return mergeAdminProducts(result.products);
}

function mergeLocalCandidates(baseProducts: Product[]): Product[] {
  const baseIds = new Set(baseProducts.map((product) => product.id));
  const localProducts = useAdminCatalogStore.getState().products.filter((product) => !baseIds.has(product.id));
  return mergeAdminProducts([...baseProducts, ...localProducts]);
}

export const productService = {
  getFeatured: async (signal?: AbortSignal) => response((await getMergedCatalogue(signal)).sort((a, b) => b.rating - a.rating).slice(0, 8)),
  getById: async (id: number, signal?: AbortSignal) => {
    await waitForAdminCatalogHydration();
    const local = useAdminCatalogStore.getState();
    if (local.deletedProductIds.includes(id)) throw new Error("This product is no longer available in the local catalogue.");
    const saved = local.products.find((product) => product.id === id);
    if (saved) return saved;
    const product = await apiGet<Product>(`/products/${id}`, signal);
    return mergeAdminProducts([product])[0] ?? product;
  },
  getAll: async (signal?: AbortSignal) => response(await getMergedCatalogue(signal)),
  getCategories: async (signal?: AbortSignal) => {
    await waitForAdminCatalogHydration();
    const categories = await apiGet<ProductCategory[]>("/products/categories", signal);
    return mergeAdminCategories(categories);
  },
  search: async (query: string, signal?: AbortSignal) => {
    await waitForAdminCatalogHydration();
    const result = await apiGet<ProductListResponse>(`/products/search?q=${encodeURIComponent(query.trim())}&limit=0`, signal);
    const normalized = query.trim().toLowerCase();
    const products = mergeLocalCandidates(result.products).filter((product) =>
      [product.title, product.description, product.brand ?? "", product.category, ...(product.tags ?? [])]
        .some((value) => value.toLowerCase().includes(normalized)),
    );
    return response(products);
  },
  getByCategory: async (slug: string, signal?: AbortSignal) => {
    await waitForAdminCatalogHydration();
    const result = await apiGet<ProductListResponse>(`/products/category/${encodeURIComponent(slug)}?limit=0`);
    return response(mergeLocalCandidates(result.products).filter((product) => product.category === slug));
  },
  discover: async (query: string, category: string, signal?: AbortSignal) => {
    if (query.trim()) return productService.search(query.trim(), signal);
    if (category) return productService.getByCategory(category, signal);
    return productService.getAll(signal);
  },
};
