import { useQuery, queryOptions } from "@tanstack/react-query";
import { checkPaymentStatus, getPaymentHistory } from "./api";

// ─── Query Key Factory ───────────────────────────────────────────────────────
export const paymentKeys = {
  all: () => ["payments"] as const,
  history: () => [...paymentKeys.all(), "history"] as const,
  status: () => [...paymentKeys.all(), "status"] as const,
};

// ─── queryOptions ─────────────────────────────────────────────────────────────
export const paymentHistoryQueryOptions = queryOptions({
  queryKey: paymentKeys.history(),
  queryFn: getPaymentHistory,
  staleTime: 30 * 1000,
});

export const paymentStatusQueryOptions = queryOptions({
  queryKey: paymentKeys.status(),
  queryFn: checkPaymentStatus,
  staleTime: 0, // Always fetch latest
  // react-query v5 syntax for refetchInterval function
  refetchInterval: (query) => {
    // If we have an active pending order, poll every 2.5s for faster QR confirmation
    if (query.state.data?.status === "PENDING") {
      return 2500;
    }
    return false;
  },
});

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function usePaymentStatusQuery() {
  return useQuery(paymentStatusQueryOptions);
}

export function usePaymentHistory() {
  return useQuery(paymentHistoryQueryOptions);
}
