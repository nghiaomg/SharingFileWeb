export interface PaymentOrder {
  id: string;
  orderId: string;
  userId: string;
  planName: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "EXPIRED" | string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
}

export interface OrdersPaginationResponse {
  orders: PaymentOrder[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
