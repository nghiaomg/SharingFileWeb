import apiClient from "@/lib/api-client";
import {
  AdminPaginatedNotificationsResponse,
  BroadcastPayload,
} from "../types/notifications.types";

export const adminNotificationsKeys = {
  all: ["admin-notifications"] as const,
  lists: () => [...adminNotificationsKeys.all, "list"] as const,
};

export async function getAllNotifications(
  page: number = 0,
  size: number = 50,
): Promise<AdminPaginatedNotificationsResponse> {
  const response = await apiClient.get(`/notifications/admin/all?page=${page}&size=${size}`);
  return response.data as AdminPaginatedNotificationsResponse;
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`/notifications/admin/${id}`);
}

export async function broadcastNotification(
  payload: BroadcastPayload,
): Promise<void> {
  await apiClient.post("/notifications/admin/broadcast", payload);
}
