import { axiosInstance } from '@/shared/api/axios.instance';
import type { Notification } from '../types/notification.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get<StandardResponse<Notification[]>>('/api/notifications');
    return response.data.data;
  },
  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.put(`/api/notifications/${id}/read`);
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<StandardResponse<number>>('/api/notifications/unread-count');
    return response.data.data;
  },
};
