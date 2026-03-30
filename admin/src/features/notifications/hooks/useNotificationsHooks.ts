import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import type { Notification } from '../types/notification.types';
import { message } from 'antd';

export const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsKeys.all, 'unreadCount'] as const,
};

export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: notificationsKeys.lists(),
    queryFn: notificationsApi.getNotifications,
    refetchInterval: 60000,
  });
};

export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
    onError: () => {
      message.error('Không thể đánh dấu thông báo');
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const notifications = queryClient.getQueryData<Notification[]>(notificationsKeys.lists());
      if (notifications) {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        await Promise.all(
          unreadNotifications.map(n =>
            notificationsApi.markAsRead(n.id)
          )
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
    onError: () => {
      message.error('Không thể đánh dấu tất cả thông báo');
    },
  });
};
