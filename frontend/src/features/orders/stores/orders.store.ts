import { create } from "zustand";
import { OrderFilters } from "../types/orders.types";

interface OrdersState {
  filters: OrderFilters;
  isDetailsModalOpen: boolean;
  selectedOrderId: string | null;
  setFilters: (filters: Partial<OrderFilters>) => void;
  openDetailsModal: (orderId: string) => void;
  closeDetailsModal: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  filters: {
    page: 0,
    size: 10,
    status: "",
    userId: "",
  },
  isDetailsModalOpen: false,
  selectedOrderId: null,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 0 }, // reset page when filters change unless page is explicitly set
    })),

  openDetailsModal: (orderId) =>
    set({
      isDetailsModalOpen: true,
      selectedOrderId: orderId,
    }),

  closeDetailsModal: () =>
    set({
      isDetailsModalOpen: false,
      selectedOrderId: null,
    }),
}));
