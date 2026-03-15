import apiClient from "@/lib/api-client";
import type { DashboardCategory, RecentFile } from "./schemas";

export async function getDashboardCategories(): Promise<DashboardCategory[]> {
  const res = await apiClient.get<DashboardCategory[]>("/dashboard/categories");
  return res.data;
}

export async function getDashboardRecentFiles(): Promise<RecentFile[]> {
  const res = await apiClient.get<RecentFile[]>("/dashboard/recent-files");
  return res.data;
}
