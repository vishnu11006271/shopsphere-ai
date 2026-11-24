import { describe, expect, it } from "vitest";
import { filterProducts, respondToShoppingRequest } from "./assistant-service";
import type { Product, ProductCategory } from "@/types/product";

const categories: ProductCategory[] = [
  { slug: "mobile-accessories", name: "Mobile Accessories", url: "" },
  { slug: "smartphones", name: "Smartphones", url: "" },
];
const products: Product[] = [
  { id: 1, title: "Wireless Headphones", description: "Over-ear audio", category: "mobile-accessories", price: 20, discountPercentage: 0, rating: 4.2, stock: 5, thumbnail: "", images: [] },
  { id: 2, title: "Premium Earbuds", description: "Wireless audio", category: "mobile-accessories", price: 30, discountPercentage: 0, rating: 4.8, stock: 5, thumbnail: "", images: [] },
  { id: 3, title: "Smartphone", description: "Mobile phone", category: "smartphones", price: 200, discountPercentage: 0, rating: 4.9, stock: 5, thumbnail: "", images: [] },
];

describe("assistant service", () => {
  it("filters by category and displayed INR price ceiling", () => {
    const result = filterProducts(products, { categorySlugs: ["mobile-accessories"], maxPrice: 2500 });
    expect(result.map((product) => product.id)).toEqual([1]);
  });

  it("returns inline-result data and explains applied filters", () => {
    const result = respondToShoppingRequest("Show me headphones under 5000", products, categories);
    expect(result.products.map((product) => product.id)).toEqual([2, 1]);
    expect(result.text).toContain("category: headphones");
    expect(result.text).toContain("up to ₹5,000");
  });

  it("asks a clarifying question for unparseable text", () => {
    const result = respondToShoppingRequest("hmm not sure", products, categories);
    expect(result.products).toHaveLength(0);
    expect(result.suggestions).toHaveLength(3);
  });
});
