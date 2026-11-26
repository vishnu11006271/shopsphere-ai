import type { Product, ProductVariant } from "@/types/product";

export function getSelectedStock(
  product: Product,
  variant?: ProductVariant | null,
): number {
  return Math.max(0, variant?.stock ?? product.stock);
}

export function clampProductQuantity(
  quantity: number,
  availableStock: number,
  minimum = 1,
): number {
  if (availableStock <= 0) return 0;
  const safeMinimum = Math.max(1, Math.floor(minimum));
  return Math.min(
    Math.max(safeMinimum, Math.floor(quantity) || safeMinimum),
    availableStock,
  );
}

export function estimateDelivery(pincode: string): { valid: boolean; message: string } {
  if (!/^\d{6}$/.test(pincode))
    return { valid: false, message: "Enter a valid 6-digit pincode." };
  const offset = Number(pincode.slice(-1)) % 3;
  const days = 3 + offset;
  return {
    valid: true,
    message: `Estimated delivery in ${days}–${days + 1} business days. (Simulated estimate)`,
  };
}

export function getDiscountedPrice(product: Product): number {
  return (
    product.price * (1 - Math.max(0, Math.min(100, product.discountPercentage)) / 100)
  );
}
