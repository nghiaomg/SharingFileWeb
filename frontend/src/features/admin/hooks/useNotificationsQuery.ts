import { useQuery } from "@tanstack/react-query";
import {
  getAllNotifications,
  adminNotificationsKeys,
} from "../api/notifications.api";

export function useAdminNotifications(page: number = 0, size: number = 50) {
  return useQuery({
    queryKey: [...adminNotificationsKeys.lists(), page, size],
    queryFn: () => getAllNotifications(page, size),
  });
}
