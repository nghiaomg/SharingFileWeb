"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { getDashboardOverview } from "./api";

export const dashboardKeys = {
  all:      () => ["dashboard"] as const,
  overview: () => [...dashboardKeys.all(), "overview"] as const,
};

export const dashboardOverviewQueryOptions = queryOptions({
  queryKey: dashboardKeys.overview(),
  queryFn: getDashboardOverview,
  staleTime: 30 * 1000,
});

export function useDashboardOverview() {
  return useQuery(dashboardOverviewQueryOptions);
}
