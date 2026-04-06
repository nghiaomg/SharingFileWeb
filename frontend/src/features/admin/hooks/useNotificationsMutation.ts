import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotification,
  broadcastNotification,
  adminNotificationsKeys,
} from "../api/notifications.api";

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminNotificationsKeys.lists(),
      }),
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: broadcastNotification,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminNotificationsKeys.all }),
  });
}
