import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import { orderKeys } from "../api/orders.keys";
import { OrderFilters } from "../types/orders.types";

export const useOrdersQuery = (filters: OrderFilters) => {
    return useQuery({
        queryKey: orderKeys.list(filters),
        queryFn: () => ordersApi.getOrders(filters),
        placeholderData: (previousData) => previousData, // keep previous data while fetching new page
    });
};
