import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.keys";

export const useOrderStatsQuery = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => ordersApi.getOrderStats(),
  });
};
