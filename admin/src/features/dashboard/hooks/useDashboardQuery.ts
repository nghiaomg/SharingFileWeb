import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  categories: () => [...dashboardKeys.all, 'categories'] as const,
  recentFiles: () => [...dashboardKeys.all, 'recentFiles'] as const,
};

export const useDashboardCategoriesQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.categories(),
    queryFn: dashboardApi.getCategories,
  });
};

export const useDashboardRecentFilesQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.recentFiles(),
    queryFn: dashboardApi.getRecentFiles,
  });
};
