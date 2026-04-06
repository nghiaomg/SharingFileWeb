import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteShareLink, adminSharesKeys } from "../api/shares.api";

export function useDeleteShareLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShareLink,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminSharesKeys.lists() }),
  });
}
