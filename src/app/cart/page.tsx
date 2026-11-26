import type { Metadata } from "next";
import { CartPage } from "@/features/cart/components/cart-page";

export const metadata: Metadata = { title: "Your cart | ShopSphere AI" };
export default function Page() {
  return <CartPage />;
}
