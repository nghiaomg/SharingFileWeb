import apiClient from "@/lib/api-client";
import {
  AdminOverview,
  DashboardChartDTO,
  StorageCategoryDTO,
  PieChartDataDTO,
  ActionLogDTO,
} from "../types/dashboard.types";

export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  overview: () => [...adminDashboardKeys.all, "overview"] as const,
  categories: () => [...adminDashboardKeys.all, "categories"] as const,
  charts: (days: number) =>
    [...adminDashboardKeys.all, "charts", days] as const,
  loginMethods: () => [...adminDashboardKeys.all, "login-methods"] as const,
  recentActions: () => [...adminDashboardKeys.all, "recent-actions"] as const,
};

export async function getAdminOverview(): Promise<AdminOverview> {
  // Try to fetch, if fails, mock fallback for now until backend is fully patched
  try {
    const response = await apiClient.get("/dashboard/admin-overview");
    return response.data as AdminOverview;
  } catch {
    return {
      totalUsers: 0,
      totalFiles: 0,
      totalStorageBytes: 0,
      totalRevenue: 0,
    };
  }
}

export async function getAdminCharts(
  days: number,
): Promise<DashboardChartDTO[]> {
  const response = await apiClient.get("/dashboard/charts", {
    params: { days },
  });
  return response.data as DashboardChartDTO[];
}

export async function getAdminCategories(): Promise<StorageCategoryDTO[]> {
  const response = await apiClient.get("/dashboard/categories");
  return response.data as StorageCategoryDTO[];
}

export async function getAdminLoginMethods(): Promise<PieChartDataDTO[]> {
  const response = await apiClient.get("/dashboard/login-methods");
  return response.data;
}

export async function getAdminRecentActions(): Promise<ActionLogDTO[]> {
  const response = await apiClient.get("/dashboard/actions");
  return response.data;
}
