import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';

export const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsKeys.all, 'unreadCount'] as const,
};

export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: notificationsKeys.lists(),
    queryFn: notificationsApi.getNotifications,
  });
};

export const useUnreadCountQuery = () => {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60000, 
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
};
