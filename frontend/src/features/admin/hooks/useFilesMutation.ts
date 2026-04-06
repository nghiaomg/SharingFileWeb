import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStorageFilePermanently, adminFilesKeys } from "../api/files.api";

export function useDeleteAdminFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStorageFilePermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFilesKeys.lists() });
    },
  });
}
