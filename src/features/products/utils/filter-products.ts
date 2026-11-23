import type { Product } from "@/types/product";
export type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";
export type ProductSort = "relevance" | "price-asc" | "price-desc" | "rating" | "newest";
export interface ProductFilters {
  minPrice: number; maxPrice: number; minRating: number;
  availability: AvailabilityFilter; onSaleOnly: boolean; brands: string[]; categories: string[]; sort: ProductSort;
}
export const DEFAULT_FILTERS: ProductFilters = {
  minPrice: 0, maxPrice: Number.POSITIVE_INFINITY, minRating: 0,
  availability: "all", onSaleOnly: false, brands: [], categories: [], sort: "relevance",
};
export function filterAndSortProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((p) => p.price * 85 >= filters.minPrice && p.price * 85 <= filters.maxPrice &&
    p.rating >= filters.minRating &&
    (filters.availability === "all" || (filters.availability === "in-stock" ? p.stock > 0 : p.stock <= 0)) &&
    (!filters.onSaleOnly || p.discountPercentage > 0) &&
    (!filters.brands.length || filters.brands.includes(p.brand ?? "Unknown")) &&
    (!filters.categories.length || filters.categories.includes(p.category))
  ).sort((a,b) => {
    switch(filters.sort) {
      case "price-asc": return a.price-b.price;
      case "price-desc": return b.price-a.price;
      case "rating": return b.rating-a.rating;
      case "newest": return b.id-a.id;
      default: return b.rating-a.rating || a.id-b.id;
    }
  });
}
export function getProductFilterChips(filters: ProductFilters): string[] {
  const chips: string[] = [];
  if (filters.minPrice > 0 || Number.isFinite(filters.maxPrice)) chips.push(`Price: ${filters.minPrice}–${Number.isFinite(filters.maxPrice) ? filters.maxPrice : "Any"}`);
  if (filters.minRating > 0) chips.push(`${filters.minRating}+ stars`);
  if (filters.availability !== "all") chips.push(filters.availability === "in-stock" ? "In stock" : "Out of stock");
  if (filters.onSaleOnly) chips.push("On sale");
  return [...chips, ...filters.brands, ...filters.categories];
}
