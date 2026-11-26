import type { CartLine } from "@/store/cart-store";

export const DISPLAY_PRICE_MULTIPLIER = 85;
export const TAX_RATE = 0.05;
export const STANDARD_SHIPPING = 99;
export const FREE_SHIPPING_THRESHOLD = 2499;

export interface CouponDefinition {
  code: string;
  percent: number;
  maxDiscount: number;
  minimumSubtotal: number;
}
export const COUPONS: Record<string, CouponDefinition> = {
  SPHERE10: { code: "SPHERE10", percent: 10, maxDiscount: 500, minimumSubtotal: 1000 },
  WELCOME15: { code: "WELCOME15", percent: 15, maxDiscount: 750, minimumSubtotal: 2500 },
};
export type CouponResult =
  | { valid: true; coupon: CouponDefinition; discount: number; message: string }
  | {
      valid: false;
      reason: "empty" | "invalid" | "expired" | "minimum";
      message: string;
    };

export function unitPriceINR(line: CartLine): number {
  return (
    line.product.price *
    (1 - Math.max(0, Math.min(100, line.product.discountPercentage)) / 100) *
    DISPLAY_PRICE_MULTIPLIER
  );
}
export function calculateSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + unitPriceINR(line) * line.quantity, 0);
}
export function validateCoupon(code: string, subtotal: number): CouponResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized)
    return { valid: false, reason: "empty", message: "Enter a coupon code first." };
  if (normalized === "EXPIRED20")
    return {
      valid: false,
      reason: "expired",
      message: "This coupon has expired. Try SPHERE10 or WELCOME15.",
    };
  const coupon = COUPONS[normalized];
  if (!coupon)
    return {
      valid: false,
      reason: "invalid",
      message: "That code isn't valid. Check the spelling or try SPHERE10.",
    };
  if (subtotal < coupon.minimumSubtotal)
    return {
      valid: false,
      reason: "minimum",
      message: `Add items worth ${formatAmount(coupon.minimumSubtotal - subtotal)} more to use ${coupon.code}.`,
    };
  const discount = Math.min((subtotal * coupon.percent) / 100, coupon.maxDiscount);
  return {
    valid: true,
    coupon,
    discount,
    message: `${coupon.code} applied — you saved ${formatAmount(discount)}.`,
  };
}
export function calculateCartTotals(lines: CartLine[], couponCode: string | null) {
  const subtotal = calculateSubtotal(lines);
  const coupon = couponCode ? validateCoupon(couponCode, subtotal) : null;
  const discount = coupon?.valid ? coupon.discount : 0;
  const taxable = Math.max(0, subtotal - discount);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = taxable * TAX_RATE;
  return { subtotal, discount, shipping, tax, total: taxable + shipping + tax, coupon };
}
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
export function stockForLine(line: CartLine): number {
  return Math.max(0, line.variant?.stock ?? line.product.stock);
}
export function samePrice(a: CartLine["product"], b: CartLine["product"]): boolean {
  return (
    unitPriceINR({ product: a, quantity: 1 }) ===
    unitPriceINR({ product: b, quantity: 1 })
  );
}
