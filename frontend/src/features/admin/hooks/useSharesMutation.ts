import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeShareLink, adminSharesKeys } from "../api/shares.api";

export function useRevokeShareLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeShareLink,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminSharesKeys.lists() }),
  });
}
