import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { ADMIN_ROLE_ID } from "@/shared/constants/roles.catalog";

export const AdminLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== ADMIN_ROLE_ID) return <Navigate to="/me" replace />;

  return <Outlet />;
};
