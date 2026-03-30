import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { axiosInstance } from '@/shared/api/axios.instance';
import { message } from 'antd';
import type {
  StorageUsage,
  Notification,
  UnreadCount,
  TrashItems,
} from '../types/dashboard.types';
import type { StandardResponse } from '@/shared/api/api.types';

// ===== Dashboard Hooks =====
export const dashboardKeys = {
  all: ['dashboard'] as const,
  categories: () => [...dashboardKeys.all, 'categories'] as const,
  recentFiles: () => [...dashboardKeys.all, 'recentFiles'] as const,
  storageUsage: () => [...dashboardKeys.all, 'storageUsage'] as const,
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

export const useStorageUsageQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.storageUsage(),
    queryFn: async () => {
      const response = await axiosInstance.get<StandardResponse<StorageUsage>>('/api/user/storage');
      return response.data.data;
    },
  });
};

// ===== Notification Hooks =====
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const response = await axiosInstance.get<StandardResponse<Notification[]>>('/api/notifications');
      return response.data.data;
    },
  });
};

export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await axiosInstance.get<StandardResponse<UnreadCount>>('/api/notifications/unread-count');
      return response.data.data;
    },
    refetchInterval: 30000,
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: () => {
      message.error('Không thể đánh dấu thông báo');
    },
  });
};

// ===== Trash Hooks =====
export const trashKeys = {
  all: ['trash'] as const,
  list: () => [...trashKeys.all, 'list'] as const,
};

export const useTrashQuery = () => {
  return useQuery({
    queryKey: trashKeys.list(),
    queryFn: async () => {
      const response = await axiosInstance.get<StandardResponse<TrashItems>>('/api/trash');
      return response.data.data;
    },
  });
};

export const useRestoreTrashMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: 'file' | 'folder'; id: string }) => {
      await axiosInstance.put(`/api/trash/restore/${type}/${id}`);
    },
    onSuccess: () => {
      message.success('Khôi phục thành công!');
      queryClient.invalidateQueries({ queryKey: trashKeys.list() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi khôi phục');
    },
  });
};

export const usePermanentDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: 'file' | 'folder'; id: string }) => {
      await axiosInstance.delete(`/api/trash/permanent/${type}/${id}`);
    },
    onSuccess: () => {
      message.success('Xóa vĩnh viễn thành công!');
      queryClient.invalidateQueries({ queryKey: trashKeys.list() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi xóa vĩnh viễn');
    },
  });
};

export const useEmptyTrashMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete('/api/trash/empty');
    },
    onSuccess: () => {
      message.success('Đã dọn sạch thùng rác!');
      queryClient.invalidateQueries({ queryKey: trashKeys.list() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi dọn thùng rác');
    },
  });
};

// ===== Subscription Hooks =====
export const useUpgradePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/api/subscription/upgrade');
    },
    onSuccess: () => {
      message.success('Nâng cấp gói cước thành công!');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi nâng cấp gói cước');
    },
  });
};