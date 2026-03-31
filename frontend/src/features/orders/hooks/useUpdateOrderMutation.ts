import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.keys";
import { Order } from "../types/orders.types";

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; status: string }) =>
      ordersApi.updateOrderStatus(params),
    onSuccess: (updatedOrder: Order) => {
      // Invalidate all lists and specific detail query
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(updatedOrder.id),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};
