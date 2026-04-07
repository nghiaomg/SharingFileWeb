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

export function useRevokeAdminFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      import("../api/files.api").then((m) => m.adminRevokeFile(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFilesKeys.lists() });
    },
  });
}

export function useRenameAdminFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      import("../api/files.api").then((m) => m.adminRenameFile(id, name)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFilesKeys.lists() });
    },
  });
}
