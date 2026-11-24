import { describe, expect, it } from "vitest";
import { extractShoppingIntent } from "./intent-parser";
import type { Product, ProductCategory } from "@/types/product";

const categories: ProductCategory[] = [
  { slug: "smartphones", name: "Smartphones", url: "" },
  { slug: "mobile-accessories", name: "Mobile Accessories", url: "" },
  { slug: "laptops", name: "Laptops", url: "" },
];
const products: Product[] = [
  { id: 1, title: "Wireless Headphones", description: "", category: "mobile-accessories", price: 20, discountPercentage: 0, rating: 4.2, stock: 10, thumbnail: "", images: [] },
  { id: 2, title: "Bluetooth Earbuds", description: "", category: "mobile-accessories", price: 35, discountPercentage: 0, rating: 4.8, stock: 10, thumbnail: "", images: [] },
];

describe("extractShoppingIntent", () => {
  it("extracts category, rupee ceiling, and good-rating floor", () => {
    const result = extractShoppingIntent("Show me smartphones under 30,000 rupees with good ratings", categories);
    expect(result.kind).toBe("search");
    expect(result.intent).toMatchObject({ categorySlugs: ["smartphones"], maxPrice: 30000, minRating: 4 });
  });

  it("maps headphone language to the mobile accessories category", () => {
    const result = extractShoppingIntent("Find headphones under ₹5,000", categories);
    expect(result.intent?.categorySlugs).toEqual(["mobile-accessories"]);
    expect(result.intent?.maxPrice).toBe(5000);
  });

  it("reduces the budget without losing the previous category", () => {
    const result = extractShoppingIntent("Show me something cheaper", categories, {
      previousIntent: { categorySlugs: ["mobile-accessories"], categoryLabel: "headphones", maxPrice: 5000 },
      previousResults: products,
    });
    expect(result.kind).toBe("refinement");
    expect(result.intent?.categorySlugs).toEqual(["mobile-accessories"]);
    expect(result.intent?.maxPrice).toBe(2337.5);
  });

  it("raises the rating threshold while preserving the earlier budget", () => {
    const result = extractShoppingIntent("Something with better ratings", categories, {
      previousIntent: { categorySlugs: ["mobile-accessories"], maxPrice: 5000, minRating: 4 },
      previousResults: products,
    });
    expect(result.intent).toMatchObject({ categorySlugs: ["mobile-accessories"], maxPrice: 5000, minRating: 4.5, sort: "rating" });
  });

  it("increases the existing budget when asked", () => {
    const result = extractShoppingIntent("Increase my budget", categories, {
      previousIntent: { categorySlugs: ["mobile-accessories"], maxPrice: 5000 },
    });
    expect(result.intent?.maxPrice).toBe(6250);
  });

  it("uses the second earlier result as a similarity seed", () => {
    const result = extractShoppingIntent("Show me more like the second one", categories, { previousResults: products });
    expect(result.kind).toBe("similar");
    expect(result.targetProduct?.id).toBe(2);
  });

  it("preserves a general budget when the customer changes category", () => {
    const result = extractShoppingIntent("Never mind, show me laptops instead", categories, {
      previousIntent: { categorySlugs: ["smartphones"], maxPrice: 30000 },
    });
    expect(result.intent).toMatchObject({ categorySlugs: ["laptops"], maxPrice: 30000 });
  });

  it("does not invent results for an unparseable message", () => {
    expect(extractShoppingIntent("hmm not sure", categories).kind).toBe("unclear");
  });
});
