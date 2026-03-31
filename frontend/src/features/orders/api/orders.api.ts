import apiClient from "@/lib/api-client";
import {
  Order,
  OrderFilters,
  OrderStats,
  PaginatedOrders,
} from "../types/orders.types";

export const ordersApi = {
  getOrders: async (filters: OrderFilters): Promise<PaginatedOrders> => {
    const params = new URLSearchParams();
    params.append(
      "page",
      Array.isArray(filters.page) ? filters.page[0] : filters.page.toString(),
    );
    params.append(
      "size",
      Array.isArray(filters.size) ? filters.size[0] : filters.size.toString(),
    );
    if (filters.status) params.append("status", filters.status);
    if (filters.userId) params.append("userId", filters.userId);

    // apiClient responses return the unpacked 'data' segment due to interceptors
    const response = await apiClient.get<unknown, PaginatedOrders>(
      `/admin/orders`,
      { params },
    );
    return response;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<unknown, Order>(`/admin/orders/${id}`);
    return response;
  },

  updateOrderStatus: async ({
    id,
    status,
  }: {
    id: string;
    status: string;
  }): Promise<Order> => {
    const response = await apiClient.put<unknown, Order>(
      `/admin/orders/${id}/status`,
      { status },
    );
    return response;
  },

  getOrderStats: async (): Promise<OrderStats> => {
    const response = await apiClient.get<unknown, OrderStats>(
      "/admin/orders/stats",
    );
    return response;
  },
};
