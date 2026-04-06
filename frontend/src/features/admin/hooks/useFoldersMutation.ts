import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFolderPermanently, adminFoldersKeys } from "../api/folders.api";

export function useDeleteAdminFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFolderPermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFoldersKeys.lists() });
    },
  });
}

export function useRevokeAdminFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      import("../api/folders.api").then((m) => m.adminRevokeFolder(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFoldersKeys.lists() });
    },
  });
}
