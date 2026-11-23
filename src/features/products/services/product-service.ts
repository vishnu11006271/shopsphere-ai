import { apiGet } from "@/services/api/http-client";
import type { Product, ProductListResponse } from "@/types/product";

export const productKeys = { all: ["products"] as const, featured: ["products", "featured"] as const };
export const productService = {
  getFeatured: (signal?: AbortSignal) => apiGet<ProductListResponse>("/products?limit=8&sortBy=rating&order=desc", signal),
  getById: (id: number, signal?: AbortSignal) => apiGet<Product>(`/products/${id}`, signal),
};
