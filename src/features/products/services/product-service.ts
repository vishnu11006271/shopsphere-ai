import { apiGet } from "@/services/api/http-client";
import type { Product, ProductCategory, ProductListResponse } from "@/types/product";

export const productKeys = {
  all: ["products"] as const,
  featured: ["products", "featured"] as const,
  catalogue: ["products", "catalogue"] as const,
  categories: ["products", "categories"] as const,
  discovery: (query: string, category: string) => ["products", "discovery", query, category] as const,
};

export const productService = {
  getFeatured: (signal?: AbortSignal) => apiGet<ProductListResponse>("/products?limit=8&sortBy=rating&order=desc", signal),
  getById: (id: number, signal?: AbortSignal) => apiGet<Product>(`/products/${id}`, signal),
  getAll: (signal?: AbortSignal) => apiGet<ProductListResponse>("/products?limit=0", signal),
  getCategories: (signal?: AbortSignal) => apiGet<ProductCategory[]>("/products/categories", signal),
  search: (query: string, signal?: AbortSignal) => apiGet<ProductListResponse>(`/products/search?q=${encodeURIComponent(query)}&limit=0`, signal),
  getByCategory: (slug: string, signal?: AbortSignal) => apiGet<ProductListResponse>(`/products/category/${encodeURIComponent(slug)}?limit=0`, signal),
  discover: async (query: string, category: string, signal?: AbortSignal) => {
    if (query.trim()) return productService.search(query.trim(), signal);
    if (category) return productService.getByCategory(category, signal);
    return productService.getAll(signal);
  },
};
