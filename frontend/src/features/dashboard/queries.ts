"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { getDashboardCategories, getDashboardRecentFiles } from "./api";

export const dashboardKeys = {
  all: () => ["dashboard"] as const,
  categories: () => [...dashboardKeys.all(), "categories"] as const,
  recentFiles: () => [...dashboardKeys.all(), "recentFiles"] as const,
};

export const dashboardCategoriesQueryOptions = queryOptions({
  queryKey: dashboardKeys.categories(),
  queryFn: getDashboardCategories,
  staleTime: 30 * 1000,
});

export const dashboardRecentFilesQueryOptions = queryOptions({
  queryKey: dashboardKeys.recentFiles(),
  queryFn: getDashboardRecentFiles,
  staleTime: 30 * 1000,
});

export function useDashboardCategories() {
  return useQuery(dashboardCategoriesQueryOptions);
}

export function useDashboardRecentFiles() {
  return useQuery(dashboardRecentFilesQueryOptions);
}
