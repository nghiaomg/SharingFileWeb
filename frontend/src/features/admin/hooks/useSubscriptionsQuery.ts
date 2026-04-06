import { useQuery } from "@tanstack/react-query";
import { getAllPlans, adminSubscriptionsKeys } from "../api/subscriptions.api";

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: adminSubscriptionsKeys.lists(),
    queryFn: getAllPlans,
  });
}
