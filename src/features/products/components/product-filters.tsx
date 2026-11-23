"use client";

import type { ProductFilters } from "@/features/products/utils/filter-products";
import type { Product } from "@/types/product";

export function ProductFiltersPanel({ products, filters, onChange, onClear }: {
  products: Product[];
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
  onClear: () => void;
}) {
  const brands = Array.from(new Set(products.map((product) => product.brand).filter((value): value is string => Boolean(value))).sort();
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  const maxPrice = Math.max(1000, ...products.map((product) => Math.ceil(product.price * 85 / 100) * 100));
  const patch = (value: Partial<ProductFilters>) => onChange({ ...filters, ...value });
  const toggle = (list: string[], value: string) => list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return <aside className="rounded-3xl bg-white p-5 shadow-soft" aria-label="Product filters">
    <div className="flex items-center justify-between"><h2 className="font-semibold">Filters</h2><button type="button" onClick={onClear} className="text-xs font-semibold text-brand">Clear all</button></div>
    <div className="mt-6">
      <h3 className="text-sm font-semibold">Price range</h3>
      <div className="mt-3 flex items-center gap-2">
        <label className="min-w-0 flex-1"><span className="sr-only">Minimum price in rupees</span><input type="number" min={0} max={Number.isFinite(filters.maxPrice) ? filters.maxPrice : undefined} value={filters.minPrice} onChange={(event) => patch({ minPrice: Math.min(Number.isFinite(filters.maxPrice) ? filters.maxPrice : Number.POSITIVE_INFINITY, Math.max(0, Number(event.target.value) || 0)) })} className="w-full rounded-xl border border-black/10 px-2 py-2 text-sm"/></label>
        <span className="text-muted">–</span>
        <label className="min-w-0 flex-1"><span className="sr-only">Maximum price in rupees</span><input type="number" min={filters.minPrice} value={Number.isFinite(filters.maxPrice) ? filters.maxPrice : ""} placeholder={String(maxPrice)} onChange={(event) => patch({ maxPrice: event.target.value ? Math.max(filters.minPrice, Number(event.target.value)) : Number.POSITIVE_INFINITY })} className="w-full rounded-xl border border-black/10 px-2 py-2 text-sm"/></label>
      </div>
      <input aria-label="Minimum price slider" type="range" min={0} max={maxPrice} step={100} value={Math.min(filters.minPrice, maxPrice)} onChange={(event) => patch({ minPrice: Math.min(Number(event.target.value), filters.maxPrice) })} className="mt-3 w-full accent-[#3f7056]"/>
      <input aria-label="Maximum price slider" type="range" min={0} max={maxPrice} step={100} value={Math.min(filters.maxPrice, maxPrice)} onChange={(event) => patch({ maxPrice: Number(event.target.value) })} className="mt-3 w-full accent-[#3f7056]"/>
      <p className="mt-1 text-xs text-muted">Displayed in INR using the project’s illustrative price conversion.</p>
    </div>
    <div className="mt-6"><h3 className="text-sm font-semibold">Minimum rating</h3><select aria-label="Minimum rating" value={filters.minRating} onChange={(event) => patch({ minRating: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"><option value={0}>Any rating</option><option value={3}>3+ stars</option><option value={4}>4+ stars</option><option value={4.5}>4.5+ stars</option></select></div>
    <div className="mt-6"><h3 className="text-sm font-semibold">Availability</h3><select aria-label="Availability" value={filters.availability} onChange={(event) => patch({ availability: event.target.value as ProductFilters["availability"] })} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"><option value="all">All products</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option></select></div>
    <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={filters.onSaleOnly} onChange={(event) => patch({ onSaleOnly: event.target.checked })} className="h-4 w-4 accent-[#3f7056]"/> On sale only</label>
    <div className="mt-6"><h3 className="text-sm font-semibold">Brand</h3><div className="mt-2 max-h-40 space-y-2 overflow-auto">{brands.map((brand) => <label key={brand} className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => patch({ brands: toggle(filters.brands, brand) })} className="accent-[#3f7056]"/>{brand}</label>)}</div></div>
    <div className="mt-6"><h3 className="text-sm font-semibold">Category</h3><div className="mt-2 max-h-40 space-y-2 overflow-auto">{categories.map((category) => <label key={category} className="flex items-center gap-2 text-sm capitalize text-muted"><input type="checkbox" checked={filters.categories.includes(category)} onChange={() => patch({ categories: toggle(filters.categories, category) })} className="accent-[#3f7056]"/>{category.replaceAll("-", " ")}</label>)}</div></div>
  </aside>;
}
