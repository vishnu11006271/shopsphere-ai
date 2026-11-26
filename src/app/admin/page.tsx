import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
