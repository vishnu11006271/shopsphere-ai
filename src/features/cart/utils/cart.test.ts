import { describe, expect, it } from "vitest";
import { calculateCartTotals, validateCoupon } from "./cart";
import type { CartLine } from "@/store/cart-store";

const lines: CartLine[] = [{ product: { id: 1, title: "Test", description: "", category: "beauty", price: 100, discountPercentage: 0, rating: 4, stock: 5, thumbnail: "", images: [] }, quantity: 2 }];

describe("cart calculations and coupons", () => {
  it("calculates subtotal, simulated shipping and tax", () => {
    const totals = calculateCartTotals(lines, null);
    expect(totals.subtotal).toBe(17000);
    expect(totals.shipping).toBe(0);
    expect(totals.tax).toBe(850);
    expect(totals.total).toBe(17850);
  });
  it("applies a valid coupon with a discount cap", () => {
    expect(validateCoupon("SPHERE10", 10000)).toMatchObject({ valid: true, discount: 500 });
  });
  it("rejects invalid, expired and below-minimum coupons", () => {
    expect(validateCoupon("NOPE", 5000)).toMatchObject({ valid: false, reason: "invalid" });
    expect(validateCoupon("EXPIRED20", 5000)).toMatchObject({ valid: false, reason: "expired" });
    expect(validateCoupon("WELCOME15", 1000)).toMatchObject({ valid: false, reason: "minimum" });
  });
  it("charges standard simulated shipping below the free threshold", () => {
    const one: CartLine[] = [{ ...lines[0], quantity: 1 }];
    expect(calculateCartTotals(one, null).shipping).toBe(99);
  });
});
