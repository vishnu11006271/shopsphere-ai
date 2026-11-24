import type { Metadata } from "next";
import { OrderHistoryPage } from "@/features/checkout/components/order-history-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
export const metadata:Metadata={title:"Order history | ShopSphere AI"};
export default function OrdersPage(){return <ProtectedRoute requiredRole="CUSTOMER"><OrderHistoryPage/></ProtectedRoute>;}
