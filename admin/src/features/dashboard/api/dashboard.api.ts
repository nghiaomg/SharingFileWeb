import { axiosInstance } from '@/shared/api/axios.instance';
import type { StorageCategory, RecentFile } from '../types/dashboard.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const dashboardApi = {
  getCategories: async (): Promise<StorageCategory[]> => {
    const response = await axiosInstance.get<StandardResponse<StorageCategory[]>>('/api/dashboard/categories');
    return response.data.data;
  },
  getRecentFiles: async (): Promise<RecentFile[]> => {
    const response = await axiosInstance.get<StandardResponse<RecentFile[]>>('/api/dashboard/recent-files');
    return response.data.data;
  },
};
