import apiClient from "@/lib/api-client";
import {
  PaymentOrder,
  OrderStatsResponse,
  OrdersPaginationResponse,
} from "../types/orders.types";

export const adminOrdersKeys = {
  all: ["admin-orders"] as const,
  lists: (page: number, status?: string) =>
    [...adminOrdersKeys.all, "list", page, status] as const,
  stats: () => [...adminOrdersKeys.all, "stats"] as const,
};

export async function getAllOrders(
  page: number = 0,
  size: number = 20,
  status?: string,
): Promise<OrdersPaginationResponse> {
  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (status && status !== "ALL") {
    queryParams.append("status", status);
  }
  const response = await apiClient.get<unknown>(
    `/admin/orders?${queryParams.toString()}`,
  );
  return response.data as OrdersPaginationResponse;
}

export async function getOrderStats(): Promise<OrderStatsResponse> {
  const response = await apiClient.get<unknown>("/admin/orders/stats");
  return response.data as OrderStatsResponse;
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<PaymentOrder> {
  const response = await apiClient.put(`/admin/orders/${id}/status`, {
    status,
  });
  return response.data as PaymentOrder;
}
