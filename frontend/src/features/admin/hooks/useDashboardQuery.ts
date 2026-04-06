import { useQuery } from "@tanstack/react-query";
import {
  getAdminOverview,
  getAdminCharts,
  getAdminCategories,
  adminDashboardKeys,
} from "../api/dashboard.api";

export function useAdminOverview() {
  return useQuery({
    queryKey: adminDashboardKeys.overview(),
    queryFn: getAdminOverview,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminCharts(days: number) {
  return useQuery({
    queryKey: adminDashboardKeys.charts(days),
    queryFn: () => getAdminCharts(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminDashboardKeys.categories(),
    queryFn: getAdminCategories,
    staleTime: 5 * 60 * 1000,
  });
}
