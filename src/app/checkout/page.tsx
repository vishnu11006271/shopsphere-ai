import type { Metadata } from "next";
import { CheckoutFlow } from "@/features/checkout/components/checkout-flow";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
export const metadata: Metadata = {
  title: "Checkout | ShopSphere AI",
  description: "Complete your simulated ShopSphere order.",
};
export default function CheckoutPage() {
  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <CheckoutFlow />
    </ProtectedRoute>
  );
}
