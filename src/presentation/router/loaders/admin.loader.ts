import { adminApi } from "@/api/clients/admin.api";
import type { AdminDashboardLoaderData } from "@/presentation/interfaces/pages/AdminDashboardLoaderData";

export const getAdminDashboardData = async (): Promise<AdminDashboardLoaderData> => {
  try {
    const stats = await adminApi.getStats();
    return { stats };
  } catch (err) {
    console.error("[admin] getStats failed:", err);
    return { stats: null };
  }
};
