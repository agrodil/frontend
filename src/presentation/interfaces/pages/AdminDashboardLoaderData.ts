import type { AdminStats } from "@/api/clients/admin.api";

export interface AdminDashboardLoaderData {
  stats: AdminStats | null;
}
