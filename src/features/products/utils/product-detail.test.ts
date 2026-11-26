import { describe, expect, it } from "vitest";
import {
  clampProductQuantity,
  estimateDelivery,
  getDiscountedPrice,
  getSelectedStock,
} from "./product-detail";
import type { Product } from "@/types/product";

const product = {
  id: 1,
  title: "Demo",
  description: "",
  category: "beauty",
  price: 100,
  discountPercentage: 20,
  rating: 4,
  stock: 8,
  thumbnail: "",
  images: [],
} satisfies Product;

describe("product detail helpers", () => {
  it("clamps quantity to stock and minimum order", () => {
    expect(clampProductQuantity(20, 5)).toBe(5);
    expect(clampProductQuantity(0, 5, 2)).toBe(2);
    expect(clampProductQuantity(2, 0)).toBe(0);
  });
  it("uses selected variant stock instead of product stock", () => {
    expect(
      getSelectedStock(product, { id: "blue", name: "Color", value: "Blue", stock: 0 }),
    ).toBe(0);
    expect(getSelectedStock(product)).toBe(8);
  });
  it("validates simulated delivery pincodes", () => {
    expect(estimateDelivery("560001").valid).toBe(true);
    expect(estimateDelivery("56001").valid).toBe(false);
  });
  it("calculates discounted catalogue price", () => {
    expect(getDiscountedPrice(product)).toBe(80);
  });
});
