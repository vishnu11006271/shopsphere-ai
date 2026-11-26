import type { Metadata } from "next";
import { OrderDetailPage } from "@/features/checkout/components/order-detail-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
export const metadata: Metadata = { title: "Order tracking | ShopSphere AI" };
export default function OrderDetailRoute() {
  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <OrderDetailPage />
    </ProtectedRoute>
  );
}
