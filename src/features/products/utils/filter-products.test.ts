import { describe, expect, it } from "vitest";
import { filterAndSortProducts, DEFAULT_FILTERS } from "./filter-products";
import type { Product } from "@/types/product";
const fixture: Product[] = [
  {
    id: 1,
    title: "Budget runner",
    description: "",
    category: "mens-shoes",
    price: 30,
    discountPercentage: 0,
    rating: 4.2,
    stock: 5,
    brand: "North",
    thumbnail: "/one.png",
    images: [],
  },
  {
    id: 2,
    title: "Premium runner",
    description: "",
    category: "mens-shoes",
    price: 80,
    discountPercentage: 20,
    rating: 4.8,
    stock: 0,
    brand: "South",
    thumbnail: "/two.png",
    images: [],
  },
  {
    id: 3,
    title: "Daily bag",
    description: "",
    category: "womens-bags",
    price: 25,
    discountPercentage: 10,
    rating: 3.7,
    stock: 8,
    brand: "North",
    thumbnail: "/three.png",
    images: [],
  },
];
describe("filterAndSortProducts", () => {
  it("combines category, INR price, rating and stock filters", () => {
    const result = filterAndSortProducts(fixture, {
      ...DEFAULT_FILTERS,
      minPrice: 2000,
      maxPrice: 5000,
      minRating: 4,
      availability: "in-stock",
      categories: ["mens-shoes"],
    });
    expect(result.map((p) => p.id)).toEqual([1]);
  });
  it("preserves the API order for relevance sorting", () => {
    expect(filterAndSortProducts(fixture, DEFAULT_FILTERS).map((p) => p.id)).toEqual([
      1, 2, 3,
    ]);
  });
  it("sorts matching products by price ascending and descending", () => {
    expect(
      filterAndSortProducts(fixture, { ...DEFAULT_FILTERS, sort: "price-asc" }).map(
        (p) => p.id,
      ),
    ).toEqual([3, 1, 2]);
    expect(
      filterAndSortProducts(fixture, { ...DEFAULT_FILTERS, sort: "price-desc" }).map(
        (p) => p.id,
      ),
    ).toEqual([2, 1, 3]);
  });
  it("returns an empty result for impossible filter combinations", () => {
    expect(filterAndSortProducts(fixture, { ...DEFAULT_FILTERS, minRating: 5 })).toEqual(
      [],
    );
  });
  it("filters discounted products and stock availability", () => {
    expect(
      filterAndSortProducts(fixture, {
        ...DEFAULT_FILTERS,
        onSaleOnly: true,
        availability: "in-stock",
      }).map((p) => p.id),
    ).toEqual([3]);
  });
});
