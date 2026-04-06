import { useQuery } from "@tanstack/react-query";
import {
  getAllOrders,
  getOrderStats,
  adminOrdersKeys,
} from "../api/orders.api";

export function useAdminOrders(page: number = 0, status?: string) {
  return useQuery({
    queryKey: adminOrdersKeys.lists(page, status),
    queryFn: () => getAllOrders(page, 20, status),
  });
}

export function useAdminOrderStats() {
  return useQuery({
    queryKey: adminOrdersKeys.stats(),
    queryFn: getOrderStats,
  });
}
