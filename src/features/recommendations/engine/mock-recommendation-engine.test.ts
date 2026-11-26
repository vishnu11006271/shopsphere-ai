import { describe, expect, it } from "vitest";
import type { Product } from "@/types/product";
import type { RecommendationSignals, RecommendationStrategy } from "../types";
import { getRecommendations, RECOMMENDATION_WEIGHTS } from "./mock-recommendation-engine";

const product = (
  id: number,
  category: string,
  tags: string[],
  price: number,
  rating = 4.2,
  brand = "Acme",
): Product => ({
  id,
  title: category + " " + tags.join(" "),
  description: "",
  category,
  price,
  discountPercentage: 0,
  rating,
  stock: 20,
  brand,
  thumbnail: "/product.png",
  images: [],
  tags,
});
const viewed = product(100, "smartphones", ["mobile", "android"], 300, 4.5, "Nova");
const saved = product(101, "smartphones", ["mobile", "android"], 320, 4.4, "Nova");
const cart = product(102, "laptops", ["computer", "portable"], 700, 4.3, "Nova");
const purchased = product(103, "laptops", ["computer", "portable"], 650, 4.6, "Nova");
const catalogue = [
  viewed,
  saved,
  cart,
  purchased,
  product(1, "mobile-accessories", ["mobile", "charger"], 310, 4.7),
  product(2, "beauty", ["skin", "care"], 280, 4.9),
  product(3, "smartphones", ["mobile", "android"], 305, 4.8, "Nova"),
  product(4, "laptops", ["computer", "portable"], 680, 4.6),
  product(5, "furniture", ["home", "decor"], 300, 4.1),
  product(6, "skin-care", ["skin", "beauty"], 290, 4.5),
];
const allEnabled: RecommendationSignals["enabledSignals"] = {
  recentlyViewed: true,
  searchHistory: true,
  categoryInterest: true,
  tagInterest: true,
  priceRange: true,
  ratingPreference: true,
  wishlist: true,
  cart: true,
  purchases: true,
  brandPreference: true,
};
const signals = (
  overrides: Partial<RecommendationSignals> = {},
): RecommendationSignals => ({
  recentlyViewed: [viewed],
  searchQueries: ["smartphones"],
  wishlist: [saved],
  cart: [cart],
  purchases: [purchased],
  enabledSignals: allEnabled,
  ...overrides,
});
const run = (
  strategy: RecommendationStrategy,
  overrides: Partial<RecommendationSignals> = {},
  currentProduct?: Product,
) =>
  getRecommendations({
    strategy,
    products: catalogue,
    signals: signals(overrides),
    currentProduct,
    limit: 8,
  });

describe("recommendation engine", () => {
  it("uses an auditable weighted score whose weights sum to one", () => {
    expect(
      Object.values(RECOMMENDATION_WEIGHTS).reduce((sum, value) => sum + value, 0),
    ).toBeCloseTo(1);
    const results = run("personalized");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((item) => expect(item.score).toBeGreaterThanOrEqual(0));
    results.forEach((item) => expect(item.score).toBeLessThanOrEqual(1));
  });
  it("returns recently viewed products in most-recent-first order", () => {
    const results = run("recently-viewed", { recentlyViewed: [saved, viewed] });
    expect(results.map((item) => item.product.id)).toEqual([101, 100]);
  });
  it("ranks similar products from the current PDP anchor", () => {
    const results = run("similar-products", {}, viewed);
    expect(results[0].product.id).toBe(3);
    expect(results.some((item) => item.product.id === 100)).toBe(false);
  });
  it("uses the dominant category for category-based suggestions", () => {
    const results = run("category-based");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.product.category === "smartphones")).toBe(true);
  });
  it("infers category-based recommendations from search history", () => {
    const results = run("category-based", {
      recentlyViewed: [],
      wishlist: [],
      cart: [],
      purchases: [],
      searchQueries: ["smartphones"],
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.product.category === "smartphones")).toBe(true);
  });
  it("ranks products near the customer's observed price average", () => {
    const results = run("price-based");
    expect(results[0].product.id).toBe(3);
  });
  it("uses wishlist and cart as separate recommendation sources", () => {
    expect(run("wishlist-based")[0].reasons[0].label).toBe("Because of your wishlist");
    expect(run("cart-based")[0].reasons[0].label).toBe("Because of your cart");
  });
  it("uses deterministic mock co-purchase category associations", () => {
    const results = run("frequently-bought-together", {
      recentlyViewed: [],
      wishlist: [],
      cart: [viewed],
      purchases: [],
    });
    expect(results[0].product.category).toBe("mobile-accessories");
  });
  it("does not invent a bundle when no co-purchase association exists", () => {
    const unrelated = product(200, "motorcycle", ["engine", "vehicle"], 900);
    const results = run("frequently-bought-together", {
      recentlyViewed: [],
      wishlist: [],
      cart: [unrelated],
      purchases: [],
    });
    expect(results).toEqual([]);
  });
  it("ranks trending products from explicit popularity and rating-velocity fixtures", () => {
    const results = run("trending", {
      recentlyViewed: [],
      wishlist: [],
      cart: [],
      purchases: [],
      searchQueries: [],
    });
    expect(results[0].product.id).toBe(1);
  });
  it("falls back to trending for a first-time visitor with no signals", () => {
    const results = run("personalized", {
      recentlyViewed: [],
      wishlist: [],
      cart: [],
      purchases: [],
      searchQueries: [],
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].strategy).toBe("personalized");
    expect(results[0].reasons[0].label).toBe("Popular fallback");
  });
  it("uses previous purchases for repeat and replenishment suggestions", () => {
    const results = run("personalized", {
      recentlyViewed: [],
      wishlist: [],
      cart: [],
      purchases: [purchased],
      searchQueries: [],
    });
    expect(results[0].product.id).toBe(103);
    expect(
      results[0].reasons.some((reason) => reason.label === "Previously purchased"),
    ).toBe(true);
  });
  it("uses search history even when the visitor has no viewed, cart or wishlist products", () => {
    const results = run("personalized", {
      recentlyViewed: [],
      wishlist: [],
      cart: [],
      purchases: [],
      searchQueries: ["smartphones"],
    });
    expect(results.some((item) => item.product.category === "smartphones")).toBe(true);
  });
  it("respects disabled personalization signals", () => {
    const results = run("recently-viewed", {
      enabledSignals: { ...allEnabled, recentlyViewed: false },
    });
    expect(results).toEqual([]);
  });
});
