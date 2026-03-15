import apiClient from "@/lib/api-client";
import type { DashboardOverview } from "./schemas";

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiClient.get<DashboardOverview>("/dashboard/overview");
  return res.data;
}
