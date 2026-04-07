import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPlan,
  updatePlan,
  deletePlan,
  restorePlan,
  initDefaultPlans,
  adminSubscriptionsKeys,
} from "../api/subscriptions.api";

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionsKeys.lists(),
      }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updatePlan>[1];
    }) => updatePlan(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionsKeys.lists(),
      }),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionsKeys.lists(),
      }),
  });
}

export function useRestorePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restorePlan,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionsKeys.lists(),
      }),
  });
}

export function useInitDefaultPlans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initDefaultPlans,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminSubscriptionsKeys.lists(),
      }),
  });
}
