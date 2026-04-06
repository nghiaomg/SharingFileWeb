import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, adminOrdersKeys } from "../api/orders.api";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
    },
  });
}
